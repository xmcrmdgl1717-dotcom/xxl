const COUNTRY_LANG = {
  CN:'zh', TW:'zht', HK:'zht', MO:'zht', SG:'en',
  US:'en', GB:'en', AU:'en', CA:'en', NZ:'en', IE:'en', IN:'en', PH:'en',
  ES:'es', MX:'es', AR:'es', CO:'es', CL:'es', PE:'es', VE:'es', UY:'es',
  SA:'ar', AE:'ar', EG:'ar', DZ:'ar', MA:'ar', IQ:'ar', JO:'ar', KW:'ar', QA:'ar',
  BR:'pt', PT:'pt',
  ID:'id',
  FR:'fr', BE:'fr', CH:'fr', SN:'fr', CI:'fr', CM:'fr',
  JP:'ja',
  RU:'ru', KZ:'ru', UA:'ru', BY:'ru',
  DE:'de', AT:'de',
  KR:'ko',
  VN:'vi',
  TR:'tr',
  TH:'th',
};

const COUNTRY_NAME_ZH = {
  CN:'中国', TW:'中国台湾', HK:'中国香港', MO:'中国澳门', US:'美国', GB:'英国',
  JP:'日本', KR:'韩国', DE:'德国', FR:'法国', ES:'西班牙', PT:'葡萄牙',
  BR:'巴西', RU:'俄罗斯', IN:'印度', ID:'印度尼西亚', TH:'泰国', VN:'越南',
  TR:'土耳其', SA:'沙特阿拉伯', AE:'阿联酋', EG:'埃及', MX:'墨西哥',
  AR:'阿根廷', CO:'哥伦比亚', CL:'智利', PE:'秘鲁', CA:'加拿大', AU:'澳大利亚',
  IT:'意大利', NL:'荷兰', PL:'波兰', UA:'乌克兰', KZ:'哈萨克斯坦',
  SG:'新加坡', MY:'马来西亚', PH:'菲律宾', NZ:'新西兰', IE:'爱尔兰',
};

function langFromCountry(cc) {
  if (!cc) return null;
  return COUNTRY_LANG[String(cc).toUpperCase()] || null;
}
function zhName(cc, fallback) {
  if (!cc) return fallback || '未知';
  return COUNTRY_NAME_ZH[String(cc).toUpperCase()] || fallback || cc;
}

module.exports = { COUNTRY_LANG, COUNTRY_NAME_ZH, langFromCountry, zhName };