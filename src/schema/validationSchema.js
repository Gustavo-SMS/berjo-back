const Joi = require('joi')

const userSchema = Joi.object({
  login: Joi.string().min(5).required().messages({
    'string.base': 'Login deve ser um texto',
    'string.empty': 'Login é obrigatório',
    'string.min': 'Login deve ter pelo menos 5 caracteres',
    'any.required': 'Login é obrigatório'
  }),
  password: Joi.string().min(6).pattern(/^[a-zA-Z0-9]{3,30}$/).required().messages({
    'string.min': 'Senha deve ter no mínimo 6 caracteres',
    'string.pattern.base': 'A senha deve conter apenas letras e números',
    'string.empty': 'Senha é obrigatória',
    'any.required': 'Senha é obrigatória'
  }),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'As senhas não coincidem',
    'any.required': 'Confirmação de senha é obrigatória'
  }),
  customerId: Joi.string().required().messages({
    'string.empty': 'Cliente é obrigatório',
    'any.required': 'Cliente é obrigatório'
  }),
  role: Joi.string().valid('USER', 'ADMIN').optional().messages({
    'any.only': 'Tipo de usuário deve ser USER ou ADMIN'
  })
})

const loginSchema = Joi.object({
  login: Joi.string().min(5).required().messages({
    'string.min': 'Login deve ter pelo menos 5 caracteres',
    'string.empty': 'Login é obrigatório',
    'any.required': 'Login é obrigatório'
  }),
  password: Joi.string().min(6).pattern(/^[a-zA-Z0-9]{3,30}$/).required().messages({
    'string.min': 'Senha deve ter no mínimo 6 caracteres',
    'string.pattern.base': 'A senha deve conter apenas letras e números',
    'string.empty': 'Senha é obrigatória',
    'any.required': 'Senha é obrigatória'
  }),
  'g-recaptcha-response': Joi.string().required().messages({
    'any.required': 'Captcha é obrigatório'
  })
})

const customerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.min': 'Nome deve ter no mínimo 3 caracteres',
    'string.max': 'Nome pode ter no máximo 50 caracteres',
    'string.empty': 'Nome é obrigatório',
    'any.required': 'Nome é obrigatório'
  }),
  email: Joi.string().email().max(40).required().messages({
    'string.email': 'Email inválido',
    'string.max': 'Email pode ter no máximo 40 caracteres',
    'string.empty': 'Email é obrigatório',
    'any.required': 'Email é obrigatório'
  }),
  docNumber: Joi.string().pattern(/^\d{11}$|^\d{14}$/).required().messages({
    'string.pattern.base': 'Número do documento deve ter 11 ou 14 dígitos',
    'string.empty': 'Documento é obrigatório',
    'any.required': 'Documento é obrigatório'
  }),
  phone: Joi.number().required().messages({
    'number.base': 'Telefone deve ser um número',
    'any.required': 'Telefone é obrigatório'
  }),
  zip: Joi.number().integer().required().messages({
    'number.base': 'CEP deve ser um número',
    'any.required': 'CEP é obrigatório'
  }),
  street: Joi.string().invalid('...').required().messages({
    'any.invalid': 'Selecione um endereço válido',
    'string.empty': 'Rua é obrigatória',
    'any.required': 'Rua é obrigatória'
  }),
  house_number: Joi.number().integer().allow('', null).optional().messages({
    'number.base': 'Número da casa deve ser um número'
  }),
  complement: Joi.string().allow('', null).optional(),
  city: Joi.string().invalid('...').required().messages({
    'any.invalid': 'Selecione uma cidade válida',
    'string.empty': 'Cidade é obrigatória',
    'any.required': 'Cidade é obrigatória'
  }),
  district: Joi.string().invalid('...').required().messages({
    'any.invalid': 'Selecione um bairro válido',
    'string.empty': 'Bairro é obrigatório',
    'any.required': 'Bairro é obrigatório'
  }),
  state: Joi.string().invalid('...').required().messages({
    'any.invalid': 'Selecione um estado válido',
    'string.empty': 'Estado é obrigatório',
    'any.required': 'Estado é obrigatório'
  })
})

const blindSchema = Joi.object({
  quantity: Joi.number().required().messages({
    'number.base': 'Quantidade deve ser um número',
    'any.required': 'Quantidade é obrigatória'
  }),
  width: Joi.number().positive().required().messages({
    'number.base': 'Largura deve ser um número positivo',
    'number.positive': 'Largura deve ser maior que zero',
    'any.required': 'Largura é obrigatória'
  }),
  height: Joi.number().positive().required().messages({
    'number.base': 'Altura deve ser um número positivo',
    'number.positive': 'Altura deve ser maior que zero',
    'any.required': 'Altura é obrigatória'
  }),
  command_height: Joi.number().positive().required().messages({
    'number.base': 'Altura do comando deve ser um número positivo',
    'number.positive': 'Altura do comando deve ser maior que zero',
    'any.required': 'Altura do comando é obrigatória'
  }),
  model: Joi.string().min(1).required().messages({
    'string.min': 'Modelo é obrigatório',
    'string.empty': 'Modelo é obrigatório',
    'any.required': 'Modelo é obrigatório'
  }),
  type_id: Joi.string().required().messages({
    'string.empty': 'Tipo é obrigatório',
    'any.required': 'Tipo é obrigatório'
  }),
  observation: Joi.string().min(0).max(191).optional().messages({
    'string.max': 'Observação pode ter no máximo 191 caracteres'
  })
})

const blindTypeSchema = Joi.object({
  type: Joi.string().required().messages({
    'string.empty': 'Tipo é obrigatório',
    'any.required': 'Tipo é obrigatório'
  }),
  collection: Joi.string().required().messages({
    'string.empty': 'Coleção é obrigatória',
    'any.required': 'Coleção é obrigatória'
  }),
  color: Joi.string().required().messages({
    'string.empty': 'Cor é obrigatória',
    'any.required': 'Cor é obrigatória'
  }),
  max_width: Joi.number().positive().allow('', null).optional().messages({
    'number.positive': 'Largura máxima deve ser maior que zero',
    'number.base': 'Largura máxima deve ser um número'
  }),
  price: Joi.number().positive().required().messages({
    'number.base': 'Preço deve ser um número',
    'number.positive': 'Preço deve ser maior que zero',
    'any.required': 'Preço é obrigatório'
  })
})

module.exports = {
    userSchema,
    loginSchema,
    customerSchema,
    blindSchema,
    blindTypeSchema,
}