Array.prototype.last = function() {
	return this[this.length-1];
};

var off = false;
var on = true;
var limit = 40;

$('textarea').width('500px')
$('textarea').height('500px')
$('textarea').val('')
var tab=[]
var addBalise = function(name, text,unshift){//regex
	tab[unshift || 'push']({
		balise : name,
		text : text
	})
	return '[ref='+ tab.length + ']';
}

var toProtect = 'backsSlashPlusSlash backSlash ref';
var toRegExp = function(s){
	return new RegExp('((' + s.replace(/\s/g, ')|(' ) + '))','g');
}
var encode = function(s){
	return s.replace(toRegExp(toProtect), '$1enc')
		.replace(/\\\//g,'backsSlashPlusSlash')//backslash
		.replace(/\\/g,'backslash')//backslash;
}
var decode = function(s){
	var regex = toRegExp((encode(toProtect)));
	s = s.replace(regex,function(m){
		return m.slice(0,-3)//enleve $enc à la fin des mot toprotect 
	})
	.replace(/backsSlashPlusSlash/g, '\\/')//backsSlashPlusSlash
	.replace(/backslash/g, '\\')//backslash;;
	return s;
}

 var rec = function(f,s1){
 	do{
		s2 = s1;
		s1 = f(s1);
	}while(s1 != s2);
	return s1;
 }

 var toXML = function(s1){//comment/\\/g
	s1 =  encode(s1)		
		.replace(/\/\/(.*)/g,function(m,$1){
			return addBalise('scom',$1);// single comment
		})
		.replace(/\/\*(.*?)\*\//gm,function(m,$1){
			return addBalise('mcom',$1);/*multiple comment */
		})
		.replace(/\/.*?\/\w*/g, function(m){
			return addBalise('regex',m);//regex
		})
		.replace(/^[\n\s\t]+/gm,'')
		.replace(/[ ]+/gm,' ')//multiple space
	addBalise('main',s1,'unshift')
}

var getInd = function(nb){
	var s2 = "";
	for(var i = nb;i--;){
		s2 += '\t'
	}
	return s2;
}

var count = function(tab){
	return tab ? tab.length : 0;
}

var ind = 0;
var addIndent = function(s){
	var s1 = ""	
	s.split('\n').forEach(function(str){
		ind -= count(str.match(/\}/g))
		s1 += getInd(ind) + str + '\n';
		ind += count(str.match(/\{/g)) ;
	})
	return s1;
}
	var arr = [];
	var cropCom = function(text,tagName){
		lastLine = (arr.join('') + text).split('\n').last()
		var lg = lastLine.length;
		if(lg - limit > 0){
			var ind = getInd(count(lastLine.match(/\t/g)));	
			var sep = '\n'+ ind + (tagName == 'scom' ? '//' : '');
			text = text.replace(eval('/.{'+ (text.length + limit - lg) +'}/'), function(m){
				return m.replace(/(.*)(\w*)/,function(m,$1,$2){
					return $1 + sep + $2;
				})
			})
			arr.push(text);
		}else{
			arr.push(text);
		}
	}
	
	/*var cropCode = function(text,tagName){
		lastLine = (arr.join('') + text).split('\n').last()
		var lg = lastLine.length;
		if(lg - limit > 0){
			var ind = getInd(count(lastLine.match(/\t/g)));	
			var sep = '\n'+ ind
			text = text.replace(eval('/.{'+ (text.length + limit - lg) +'}/'), function(m){
				return m.replace(/(.*)(\w*)/,function(m,$1,$2){
					return $1 + sep + $2;
				})
			})
			arr.push(text);
		}else{
			arr.push(text);
		}
	}*/
	var crop = function(text,tagName){
		if(tagName == 'scom' || tagName == 'mcom'){
			cropCom(text,tagName)
		}else{
			cropCom(text);
		}
	}
	var beautifull = function(s){
	tab = []; 
	toXML(s);
	ind = 0; 

	tab.forEach(function(s,i){
		s.text = decode(s.text)
		if( s.balise == 'scom'){
			s.text = '//' + s.text;
		}else if( s.balise == 'mcom'){
			s.text = '/*' + s.text + '*/';
		}
	})	
	s = tab[0].text	= addIndent(tab[0].text)
	arrCode = s.split(/\[ref=(\d+)\]/g);

	arrCode.forEach(function(text,i){
		if(i%2){
			crop(tab[text].text,tab[text].balise);
		}else{
			crop(text,'code')
		}
	})
	s = arr.join('')
	/*s = s.replace(/\n(\t+)\..*(\n\1\t.*)+?\n\1[^\t]/gm, function(m){
		return m.replace(/(\t+)/g,'$1\t');
	})*/
	s = s.replace(/\t/g,'    ');
	return s;
}




