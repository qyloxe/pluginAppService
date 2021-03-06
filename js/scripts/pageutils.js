//version 1.0.0

function isIE() {
   return !!document.all && !!window.attachEvent && !window.opera;
}

function htmlDecode(str) {
  var entMap={'quot':34,'amp':38,'apos':39,'lt':60,'gt':62};
  return str.replace(/&([^;]+);/g,function(m,n) {
    var code;
    if (n.substr(0,1)=='#') {
      if (n.substr(1,1)=='x') {
        code=parseInt(n.substr(2),16);
      } else {
        code=parseInt(n.substr(1),10);
      }
    } else {
      code=entMap[n];
    }
    return (code===undefined||code===NaN)?'&'+n+';':String.fromCharCode(code);
  });
}

function split_ext(str) {
   return typeof str!="undefined" ? str.substring(str.lastIndexOf("."),str.length).toLowerCase() : false;
}

function split_path(str) {
   return typeof str!="undefined" ? str.substring(0,str.lastIndexOf(".")) : false;
}
