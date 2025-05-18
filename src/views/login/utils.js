import { reactive } from 'vue'

/** 密码正则（密码格式应为6-10位数字、字母、符号的任意两种组合） */
export const REGEXP_PWD = /^[A-Za-z0-9]{6,10}$/

export const REGEXP_MOBILE = /^1[0-9]{10}$/
 
