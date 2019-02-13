Array.prototype.last = function() {
    return this[this.length-1];
};
var conf = {
	break_line: false,//doit on sauter une ligne après un {
  indent_line_previous_line: ',./*+=^|&',
	indent_line_current_line: ',./*+=^|&',//doit on sauter une ligne après
	indent_only_once: true,//if there is 2 "{" unclosed don't indent twice
	limit: 80// doit on sauter une ligne après un certain nombre de caractères dans les commentaires
}
$('textarea').width('200px').height('200px')
var tab=[]
var unindent = function(text){
  return text.replace(/[ \t]/g,'')// remove existing indentation
}

var decode = function(line3, ind,only_protected){
  return line3.replace(/\[ref=(\d+)\]/g,function(m,$1){
      var tag = tab[$1]
      if(only_protected){
        return tag.text
      }
      return (tag instanceof Protected_tag) ? m :  tag.decode(ind)
  })
}

class Tag{
  constructor(o){
    this.name = o.name
    this.text = o.text
    this.indent_str = ''
  }
  unindent(){
    this.text = this.text.replace(/^[ \t]*/g,'')// remove existing indentation
  }

  decode(indent_str){
      return this.text = decode(this.text,'',false)
  }

}
  class Protected_tag extends Tag{
      decode(indent){
        throw 'this is not supposed to happen'
      }
  }


  class Comment_tag extends Tag{
      constructor(o){
        super(...arguments)
        this.is_multiple = o.others.is_multiple
      }

      decode(ind){
          // var is_multiple = this.is_multiple
          // var sep = '\n' + (ind || '');
          // var lines = this.text.split('\n').map(function(line,i){
          //     if(i > 0){
          //       line = unindent(line)
          //     }
          //     // do{
          //     //     var lg = line.length
          //     //     line = line.replace(eval('/.{'+ conf.limit +'}/g'), function(m){//detection of long lines
          //     //         return m.replace(/([\S]*)(\s)*$/,function(m,$1,$2){ // split long line in two before the last word
          //     //             var sep = '\n'+ (is_multiple ? ($2 !== '*' ? '*' : '')  : '//')
          //     //             return sep + $1;
          //     //         })
          //     //     })
          //     // }while(line.length != lg )//continue until there is no more too long line, it can happen when the line is very long that we have to do it several time
          //     // if(i && is_multiple){
          //     //   line = line.replace(/(^[\t\s]*)\*?/g,'$1*')// put a * at the start if not present and not the first line of commment
          //     // }
          //     return line
          // })
          return this.text //= lines.join(sep)
      }
  }

class Main_tag extends Tag{
  decode(indent_str){
    this.unindent()
    var text = addIndent(this.text)
    var lines = text.split('\n')
    var texts = lines.map(function(line3){
        var inds = line3.match(/^\t*/)//get the indentation of the line
        var ind = (indent_str || '') + (inds && inds[0] || '')
        return decode(line3,ind,false)
    })
    if(texts.last().length == 0){
      --texts.length
    }
    return this.text = decode(texts.join('\n'),'',true)
  }
}
class Quote_tag extends Tag{}
class RegExp_tag extends Tag{}

//push the Tag in an Array, and return a reference to the position of the tag in the array
//if unshift has value 'unshift' then push at the start of the array instead of the end
var addBalise = function(name, text, others){//regex
    var _class = eval(name)
    tab.push( new _class({
        balise : name,
        text : text,
        others: others
    }))
    return '[ref='+ (tab.length - 1) + ']';
}

var rec = function(f,s1){
    do{
        s2 = s1;
        s1 = f(s1);
    }while(s1 != s2);
    return s1;
}
var toXML = function(s1){//comment/\\/g
    //empty charactère at pos 0 of tab that represent end of line
    //before a comment [ref=0]'
    var end_of_line = addBalise('Protected_tag','',{
      type:'end_of_line'
    })
    //protect string that use [ref=a number]
    s1 = s1.replace(/\[ref=(\d+)\]/g,function(m){
        return addBalise('Protected_tag',m);
    })
    s1 = s1.replace(/\\./g, function(m){
        return addBalise('Protected_tag',m,{
          type:'backSlash'
        });
    })
    s1 = s1.replace(/\/\/(.*)/g,function(m,$1){
        return end_of_line+addBalise('Comment_tag',m,{
          is_multiple: false
        });// single comment
    })
    s1 = s1.replace(/\/\*([\s\S]*?)\*\//gm,function(m,$1){
        return end_of_line + addBalise('Comment_tag',m,{
          is_multiple: true
        });/*multiple comment */
    })
    s1 = s1.replace(/\/.*?\/\w*/g, function(m){
        return addBalise('RegExp_tag',m,{
          type: 'regex'
        });//regex
    })
    s1 = s1.replace(/(["']).*?\1/g, function(m){
        return addBalise('Quote_tag',m,{
          type: 'quote'
        });//quote
    })
    s1 = s1.replace(/^[\n\s\t]+/gm,'')//pas d'espace en début de ligne
    s1 = s1.replace(/[ ]+/gm,' ')//multiple space
    addBalise('Main_tag',s1)
}
var getInd = function(nb){
    var s2 = "";
    for(var i = nb;i-->0;){
        s2 += '\t'
    }
    return s2;
}
var count = function(tab){
    return tab ? tab.length : 0;
}
var addIndent = function(s,ind=0){
    var s1 = ""
    var lines = s.split('\n')
    var smaller_indent = 0
    var main_block
    var bloc = main_block = {
      indent: 0,
      start : 0,
      end: lines.length - 1
    }
    var all_blocs = [bloc]
    var bloc_openner = []
    lines.forEach(function(str,i){
        // for(var j = 0;j < str.length;++j){
        //   var matcher = {
        //     '}':'{',
        //     '[':']',
        //     ')':'('
        //   }
        //   var char = str[j]
        //   if(char.test(/\)|\]|\}/){
        //     if(matcher[char] && matcher[char] != bloc_openner[bloc_openner.length-1]){
        //       li
        //     }
        //   }
        //
        //       break;
        //     default:
        //
        //   }
        // }
        // str.match(/\}|\]/g)
        var less = count(str.match(/\}|\]/g)) /*if } or ] */
        var plus = count(str.match(/\{|\[/g)) ;/*if { or [ */
        ind -= Math.max(less - plus,0)
        smaller_indent = Math.min(ind,smaller_indent)
        for(var j = bloc.indent + 1; j <= ind;++j){
            var parent = bloc
            bloc = {
              indent: j,
              start: i,
              parent: bloc,
            }
            all_blocs.push(bloc)
        }
        for(var j = bloc.indent - 1; j >= ind;--j){
            bloc.end = i - 1
            if(!bloc.parent){
              smaller_indent = bloc.indent - 1
              bloc.parent = {
                indent: smaller_indent,
                start : 0,
                end: lines.length - 1
              }
              all_blocs.unshift(bloc.parent)
            }
            bloc = bloc.parent

        }
        ind += Math.max(plus - less,0)
    })

    // if a square of code is indent more than with one indent comparing
    // to previous indent AND next unindent then reduce indent
    var reduce_indentation = function(block){
      if(!block.parent)return;
      if(block.parent.start == block.start && block.parent.end == block.end){
        block.indent = block.parent.indent
      }else{
        block.indent = block.parent.indent + 1
      }
    }

    if(conf.indent_only_once){
      all_blocs.forEach(function(block,i){
        reduce_indentation(block)
      })
    }

    var indent_by_line = []
    //this code is not optimized for perfs
    all_blocs.forEach(function(block,i){
      // if(i && block.indent != block.parent.indent){
        for(var i = block.start;i <= block.end;++i){
          indent_by_line[i] = block.indent
        }
      // }
    })
    var smaller_indent = indent_by_line[0]
    indent_by_line.forEach(function(indent){
        smaller_indent = Math.min(indent,smaller_indent)
    })
    var indent_cause_previous = false;
    lines.forEach(function(str,i){
      var indent = eval('/^\s*['+ conf.indent_line_current_line +']/').test(str)
        || indent_cause_previous
      s1 += getInd((indent_by_line[i]||0) - smaller_indent + indent ) + str + '\n';
      //[ref=0] is before a comment to represent the end of the line
      indent_cause_previous = eval('/.*['+ conf.indent_line_previous_line +']((\\[ref=0\\].*)|\\s*)$/').test(str)
    })

    return s1;
}

var beautifull = function(s){
    tab = [];
    toXML(s);
    var main = tab[tab.length - 1]
		if(conf.break_line){
			main.text = main.text
				 .replace(/\{/g,'{\n')/** saut de ligne après { */
			   .replace(/\}/g,'\n}')
		}
    main.decode()
    return main.text
}
$('#indent').click(function(){
    $('textarea').val(beautifull($('textarea').val()))
})
