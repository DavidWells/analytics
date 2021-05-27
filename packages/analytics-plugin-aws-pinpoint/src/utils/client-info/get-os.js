/* UAParser.js v0.7.28
   Copyright © 2012-2021 Faisal Salman <f@faisalman.com>
   MIT License
   Modified by David Wells
*/

const OBJ_TYPE = 'object'
const STR_TYPE = 'string'
const UNKNOWN = '?'
const NAME = 'name'
const VERSION = 'version'
const EMPTY = ''
const FUNC_TYPE = 'function'
const UNDEF_TYPE = 'undefined'
var BLACKBERRY = 'BlackBerry',
    CHROME  = 'Chrome',
    FIREFOX = 'Firefox'

const windowsVersionMap = {
  'ME'        : '4.90',
  'NT 3.11'   : 'NT3.51',
  'NT 4.0'    : 'NT4.0',
  '2000'      : 'NT 5.0',
  'XP'        : ['NT 5.1', 'NT 5.2'],
  'Vista'     : 'NT 6.0',
  '7'         : 'NT 6.1',
  '8'         : 'NT 6.2',
  '8.1'       : 'NT 6.3',
  '10'        : ['NT 6.4', 'NT 10.0'],
  'RT'        : 'ARM'
}

const os = [[
  /* Windows */
  // Windows (iTunes)
  /microsoft (windows) (vista|xp)/i], [NAME, VERSION],
  // Windows RT
  [ 
    /(windows) nt 6\.2; (arm)/i,
    // Windows Phone                                       
    /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, 
    /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i
  ],
  [ NAME, [VERSION, strMapper, windowsVersionMap] ], 
  [ /(win(?=3|9|n)|win 9x )([nt\d\.]+)/i ], 
  [ [NAME, 'Windows'], [VERSION, strMapper, windowsVersionMap] ], 
  /* iOS/macOS */
  // iOS
  [
    /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,
    /cfnetwork\/.+darwin/i
  ], 
  [ [VERSION, /_/g, '.'], [NAME, 'iOS'] ],
  // Mac OS
  [
    /(mac os x) ?([\w\. ]*)/i,
    /(macintosh|mac_powerpc\b)(?!.+haiku)/i
  ], 
  [ [NAME, 'MacOS'], [VERSION, /_/g, '.'] ],
  /*  Mobile OSes */
  // Android-x86
  [ /droid ([\w\.]+)\b.+(android[- ]x86)/i], [VERSION, NAME], 
  // Android/WebOS/QNX/Bada/RIM/Maemo/MeeGo/Sailfish OS
  [
    /(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i,
    // Blackberry
    /(blackberry)\w*\/([\w\.]*)/i,
    // Tizen/KaiOS
    /(tizen|kaios)[\/ ]([\w\.]+)/i,
    // Series 40
    /\((series40);/i
  ], [NAME, VERSION], 
  // BlackBerry 10
  [ /\(bb(10);/i], [VERSION, [NAME, BLACKBERRY] ], 
  // Firefox OS
  [ /mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i ], 
  [ VERSION, [NAME, FIREFOX+' OS'] ],
  // WebOS
  [
    /web0s;.+rt(tv)/i,
    /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i
    ], [VERSION, [NAME, 'webOS']
  ],
  // Google Chromecast
  [ /crkey\/([\d\.]+)/i], 
  // Google Chromecast
  [ VERSION, [NAME, CHROME+'cast'] ],
  // Chromium OS
  [ /(cros) [\w]+ ([\w\.]+\w)/i], [ [ NAME, 'Chromium OS' ], VERSION ],
  // Other
  [
    // Mageia/VectorLinux
    /(mageia|vectorlinux)[; ]/i,                                
    // Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware/Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus/Raspbian/Plan9/Minix/RISCOS/Contiki/Deepin/Manjaro/elementary/Sabayon/Linspire
    /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
    // Hurd/Linux
    /(hurd|linux) ?([\w\.]*)/i,
    // GNU
    /(gnu) ?([\w\.]*)/i,
    // UNIX
    /(unix) ?([\w\.]*)/i
  ], [NAME, VERSION]
]

function rgxMapper(ua, arrays) {
  var i = 0, j, k, p, q, matches, match;
  // loop through all regexes maps
  while (i < arrays.length && !matches) {
    var regex = arrays[i], // even sequence (0,2,4,..)
        props = arrays[i + 1]; // odd sequence (1,3,5,..)
        j = k = 0;

    // try matching uastring with regexes
    while (j < regex.length && !matches) {
      matches = regex[j++].exec(ua);

      if (!!matches) {
        for (p = 0; p < props.length; p++) {
          match = matches[++k];
          q = props[p];
          // check if given property is actually array
          if (typeof q === OBJ_TYPE && q.length > 0) {
            if (q.length == 2) {
              if (typeof q[1] == FUNC_TYPE) {
                // assign modified match
                this[q[0]] = q[1].call(this, match);
              } else {
                // assign given value, ignore regex match
                this[q[0]] = q[1];
              }
            } else if (q.length == 3) {
              // check whether function or regex
              if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                // call function (usually string mapper)
                this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
              } else {
                // sanitize match using given regex
                this[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
              }
            } else if (q.length == 4) {
              this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
            }
          } else {
            this[q] = match ? match : undefined;
          }
        }
      }
    }
    i += 2;
  }
}

function strMapper(str, map) {
  for (var i in map) {
    // check if current value is array
    if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
      for (var j = 0; j < map[i].length; j++) {
        if (has(map[i][j], str)) {
          return (i === UNKNOWN) ? undefined : i;
        }
      }
    } else if (has(map[i], str)) {
      return (i === UNKNOWN) ? undefined : i;
    }
  }
  return str;
}

function has(str1, str2) {
  return typeof str1 === STR_TYPE ? lowerize(str2).indexOf(lowerize(str1)) !== -1 : false;
}

function lowerize(str) {
  return str.toLowerCase()
}

export default function getOS(ua) {
  var _ua = ua || ((typeof window !== UNDEF_TYPE && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
  var _os = {};
  _os[NAME] = undefined;
  _os[VERSION] = undefined;
  rgxMapper.call(_os, _ua, os);
  return _os;
}