var off = false;
var on = true;

$('textarea').width('500px')
$('textarea').height('500px')
$('textarea').val('')
var tab=[]
var addBalise = function(name, text){//regex
	tab.push({
		balise : name,
		text : text
	})
	return '[ref='+ (tab.length - 1) + ']';
}

var toProtect = 'backsSlashPlusSlash backSlash ref';
var toRegexp = function(s)
	return new RegExpr('((' + s.replace(/\s/g, ')|(' ) + ')','g');

var regexDec = regexEnc.replace(/(\w*)/g, '$1enc');
var encode = function(s){
	return s.replace(toRegexp(toProtect), '$1enc');
}
var decode = function(s){
	encode(toProtect);
	var regex =  toProtect.replace(/(\w*)/g,'$1Encode');
}


toXML = function(s1){//comment/\\/g
	s1 =  s1
		.replace(/(C)|(backSlash)/g,function(m){//protection
			return m+'2';
		})
		.replace(/\\\//g,'backsSlashPlusSlash')//backslash
		.replace(/\\/g,'backslash')//backslash
		.replace(/\/\/(.*)/g,function(m,$1){
			return addBalise('scom',$1);// single comment
		})
		.replace(/\/[^*]\w*?\/.*/g, function(m){
			return addBalise('regex',m);//regex
		})
		.replace(/\/(.*)/gm,function(m,$1){
			return addBalise('mcom',$1);//multiple comment 
		})	
		.replace(' s1');
}

var beautifull = function(s2){
	var $s1;
	s1 = toXML(s2)
	do{
		s2 = s1;
		var s1 = s2.replace(/\[ref=(\d)+\]/g, function(m,$1){
			return tab[$1].text;
		});
	}while(s1 != s2);
	return s2;
}


