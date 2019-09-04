
const ignorePatterns = [
  /passw(or)?d/i,
  /^pw$/,
  /^pass$/i,
  /secret/i,
  /token/i,
  /api[-._]?key/i,
  /session[-._]?id/i,
  // ^ generic exclusions
  /c{1,2}(redit)?(\W|_)?card$/,
  /*
  ^ matches
  credit card
  credit-card
  credit_card
  c_card
  cc_card
  ccard
  */
  /^c{1,2}(ard)?(\W|_)?num(ber)?$/,
  /*
  ^ matches
  card number
  card_number
  card-number
  card num
  card_num
  card-num
  cardnum
  ccardnum
  ccardnumber
  */
  /^exp(iration|iry)?((\W|_)?num(ber)?)?$/,
  /*
  ^ matches
  expiration
  exp
  expiry
  exp-num
  exp_num
  exp num
  exp-number
  exp_number
  exp number
  expiration-num
  expiration_num
  expiration num
  expiration-number
  expiration_number
  expiration number
  expiry-num
  expiry_num
  expiry num
  expiry-number
  expiry_number
  expiry number
  */
  /^(c(vv|vc|id|vd|vn|ve)?(\d)?)((\W|_)?(code|num(ber)?)?)$/,
  /*
  https://en.wikipedia.org/wiki/Card_security_code
  cvv number
  cvc
  cid
  cvd
  cvc2
  cvn2
  cvv2 code
  cve
  cvn2 number
  cvv2-number
  cve num
  cve code
  */
  /^(secur(e|ity))?(\d)?((\W|_)?(code|num(ber)?))$/,
  /*
  ^ match
  secure code
  secure number
  secure num
  security num
  security-number
  security number
  */
  /^(soc(ial)?|s)?(\W|_)?(sec(urity)?|s)(\W|_)?(num(ber)?|n)$/,
  /*
  ^ matches
  social security number
  social-security-number
  social_security_number
  soc security number
  soc-security-number
  soc_security_number
  soc sec number
  soc-sec-number
  soc_sec_number
  soc sec num
  soc-sec-num
  soc_sec_num
  ssn
  s-s-n
  s s n
  s_s_n
  */
  /^discover|amex|visa|american(\W|_)?express|master(\W|_)?card$/
  /*
  ^ matches
  discover
  visa
  mastercard
  master card
  master_card
  master-card
  amex
  american express
  american_express
  american-express
  americanexpress
  */
]

/*
  Reserved values
  /^\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}$/
*/

export default ignorePatterns
