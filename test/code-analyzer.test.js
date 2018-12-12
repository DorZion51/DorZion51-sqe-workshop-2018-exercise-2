import assert from 'assert';
import {parseCode,start} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('one', () => {
        assert.equal(
            start('let t=[1,2,3,true,\'hello\'];\n' +
                'let s =true;\n' +
                's=false;\n' +
                'function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    let n=\'hello\'\n' +
                '    z[1]=5;\n' +
                '    z[0]=\'hello\';\n' +
                '    if(n == z[0]){\n' +
                '       return n;\n' +
                '    }\n' +
                '    if (b < z[1]) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n' +
                'let n1=8;','1,2,[3,5]'),
            '<a>let&nbsp t=[1,2,3,true,\'hello\'];</a></br><a>let&nbsp s&nbsp =true;</a></br><a>s=false;</a></br><a>function&nbsp foo(x,&nbsp y,&nbsp z){</a></br><a style="background-color:green;">&nbsp &nbsp &nbsp &nbsp if((hello==hello)){</a></br><a>&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp return&nbsp (hello){</a></br><a>&nbsp &nbsp &nbsp &nbsp }</a></br><a style="background-color:green;">&nbsp &nbsp &nbsp &nbsp if&nbsp ((((x+1)+y)&nbsp <&nbsp 5)){</a></br><a>&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp return&nbsp ((((x+y)+z)+(0+5))){</a></br><a style="background-color:red;">&nbsp &nbsp &nbsp &nbsp }&nbsp else&nbsp if&nbsp ((((x+1)+y)&nbsp <&nbsp (z*2))){</a></br><a>&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp return&nbsp ((((x+y)+z)+((0+x)+5))){</a></br><a>&nbsp &nbsp &nbsp &nbsp }&nbsp else&nbsp {</a></br><a>&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp return&nbsp ((((x+y)+z)+((0+z)+5))){</a></br><a>&nbsp &nbsp &nbsp &nbsp }</a></br><a>}</a></br><a>let&nbsp n1=8;</a></br>'
        );
    });
    it('two', () => {
        assert.equal(
            start('let t=[1,2,3,true,\'hello\'];\n' +
                'let s =true;\n' +
                's=false;\n' +
                'function foo(x, y, z){\n' +
                '    let a = [1,2,3];\n' +
                '    while(x>a[1]){\n' +
                '     return -a[1];\n' +
                '   }\n' +
                '}\n' +
                'let n1=8;','1,2,[3,5]'),
            '<a>let&nbsp t=[1,2,3,true,\'hello\'];</a></br><a>let&nbsp s&nbsp =true;</a></br><a>s=false;</a></br><a>function&nbsp foo(x,&nbsp y,&nbsp z){</a></br><a>&nbsp &nbsp &nbsp while((x>2)){</a></br><a>&nbsp &nbsp &nbsp &nbsp &nbsp return&nbsp (-(2)){</a></br><a>&nbsp &nbsp &nbsp }</a></br><a>}</a></br><a>let&nbsp n1=8;</a></br>'
        );
    });
    it('three', () => {
        assert.equal(
            start('let t=[1,2,3,true,\'hello\'];\n' +
                'let s =true;\n' +
                's=false;\n' +
                'function foo(x, y, z){\n' +
                '    let a = [1,2,3];\n' +
                '    if(true){\n' +
                '     return 5;\n' +
                '   }\n' +
                '}\n' +
                'let n1=8;','1,2,[3,5]'),
            '<a>let&nbsp t=[1,2,3,true,\'hello\'];</a></br><a>let&nbsp s&nbsp =true;</a></br><a>s=false;</a></br><a>function&nbsp foo(x,&nbsp y,&nbsp z){</a></br><a style="background-color:green;">&nbsp &nbsp &nbsp &nbsp if(true){</a></br><a>&nbsp &nbsp &nbsp &nbsp &nbsp return&nbsp 5;</a></br><a>&nbsp &nbsp &nbsp }</a></br><a>}</a></br><a>let&nbsp n1=8;</a></br>'
        );
    });
    it('four', () => {
        assert.equal(
            start('let t=[1,2,3,true,\'hello\'];\n' +
                'let s =true;\n' +
                's=false;\n' +
                'function foo(x, y, z){\n' +
                '    let a = [1,2,3];\n' +
                '    let b=a[1];\n' +
                '    while(true){\n' +
                '     return b;\n' +
                '   }\n' +
                '}\n' +
                'let n1=8;','1,2,[3,5]'),
            '<a>let&nbsp t=[1,2,3,true,\'hello\'];</a></br><a>let&nbsp s&nbsp =true;</a></br><a>s=false;</a></br><a>function&nbsp foo(x,&nbsp y,&nbsp z){</a></br><a>&nbsp &nbsp &nbsp while(true){</a></br><a>&nbsp &nbsp &nbsp &nbsp &nbsp return&nbsp (2){</a></br><a>&nbsp &nbsp &nbsp }</a></br><a>}</a></br><a>let&nbsp n1=8;</a></br>'
        );
    });
    it('five', () => {
        assert.equal(
            start('let t=[1,2,3,true,\'hello\'];\n' +
                'let s =t[1];\n' +
                's=false;\n' +
                'function foo(x, y, z){\n' +
                '    let a = [1,y,3];\n' +
                '    let b=a[1];\n' +
                '    while(true){\n' +
                '     return b;\n' +
                '   }\n' +
                '}\n' +
                'let n1=8;','1,2,[3,5]'),
            '<a>let&nbsp t=[1,2,3,true,\'hello\'];</a></br><a>let&nbsp s&nbsp =t[1];</a></br><a>s=false;</a></br><a>function&nbsp foo(x,&nbsp y,&nbsp z){</a></br><a>&nbsp &nbsp &nbsp while(true){</a></br><a>&nbsp &nbsp &nbsp &nbsp &nbsp return&nbsp (y){</a></br><a>&nbsp &nbsp &nbsp }</a></br><a>}</a></br><a>let&nbsp n1=8;</a></br>'
        );
    });
    it('six', () => {
        assert.equal(
            start('let t=[1,2,3,true,\'hello\'];\n' +
                'let s =5;\n' +
                's=[1,s,false];\n' +
                'function foo(x, y, z){\n' +
                '    let a = [1,y,false];\n' +
                '    let b=a[1];\n' +
                '    while(true){\n' +
                '     return b;\n' +
                '   }\n' +
                '   if(s[1]>-s){\n' +
                '    return -s;\n' +
                '   }\n' +
                '   if(a[2]){\n' +
                '    return false;\n' +
                '   }\n' +
                '}\n' +
                'let n1=8;','1,2,[3,5]'),
            '<a>let&nbsp t=[1,2,3,true,\'hello\'];</a></br><a>let&nbsp s&nbsp =5;</a></br><a>s=[1,s,false];</a></br><a>function&nbsp foo(x,&nbsp y,&nbsp z){</a></br><a>&nbsp &nbsp &nbsp while(true){</a></br><a>&nbsp &nbsp &nbsp &nbsp &nbsp return&nbsp (y){</a></br><a>&nbsp &nbsp &nbsp }</a></br><a style="background-color:green;">&nbsp &nbsp &nbsp if((s>-(s))){</a></br><a>&nbsp &nbsp &nbsp &nbsp return&nbsp (-(s)){</a></br><a>&nbsp &nbsp &nbsp }</a></br><a style="background-color:red;">&nbsp &nbsp &nbsp if(false){</a></br><a>&nbsp &nbsp &nbsp &nbsp return&nbsp false;</a></br><a>&nbsp &nbsp &nbsp }</a></br><a>}</a></br><a>let&nbsp n1=8;</a></br>'
        );
    });
    it('seven', () => {
        assert.equal(
            start('let t=[1,2,3,true,\'hello\'];\n' +
                'let n =false;\n' +
                'let s=[1,s,false];\n' +
                'function foo(x, y, z){\n' +
                '    let a = [1,y,false];\n' +
                '    let b=a[1];\n' +
                '    while(true){\n' +
                '     return b;\n' +
                '   }\n' +
                '   if(n==s[2]){\n' +
                '    return -s;\n' +
                '   }\n' +
                '   if(a[2]){\n' +
                '    return false;\n' +
                '   }\n' +
                '}\n' +
                'let n1=8;','1,2,3'),
            '<a>let&nbsp t=[1,2,3,true,\'hello\'];</a></br><a>let&nbsp n&nbsp =false;</a></br><a>let&nbsp s=[1,s,false];</a></br><a>function&nbsp foo(x,&nbsp y,&nbsp z){</a></br><a>&nbsp &nbsp &nbsp while(true){</a></br><a>&nbsp &nbsp &nbsp &nbsp &nbsp return&nbsp (y){</a></br><a>&nbsp &nbsp &nbsp }</a></br><a style="background-color:green;">&nbsp &nbsp &nbsp if((n==s[2])){</a></br><a>&nbsp &nbsp &nbsp &nbsp return&nbsp (-(s)){</a></br><a>&nbsp &nbsp &nbsp }</a></br><a style="background-color:red;">&nbsp &nbsp &nbsp if(false){</a></br><a>&nbsp &nbsp &nbsp &nbsp return&nbsp false;</a></br><a>&nbsp &nbsp &nbsp }</a></br><a>}</a></br><a>let&nbsp n1=8;</a></br>'
        );
    });
    it('eight', () => {
        assert.equal(
            start('let t=[1,2,3,true,\'hello\'];\n' +
                'let n =false;\n' +
                'let s=[1,s,false];\n' +
                'function foo(x, y, z){\n' +
                '    let a = [1,y,false];\n' +
                '    let b=a[1];\n' +
                '    while(true){\n' +
                '     return b;\n' +
                '   }\n' +
                '   if(n==s[3]){\n' +
                '    return -s;\n' +
                '   }\n' +
                '   if(a[2]){\n' +
                '    return false;\n' +
                '   }\n' +
                '}\n' +
                'let n1=8;','1,2,3'),
            '<a>let&nbsp t=[1,2,3,true,\'hello\'];</a></br><a>let&nbsp n&nbsp =false;</a></br><a>let&nbsp s=[1,s,false];</a></br><a>function&nbsp foo(x,&nbsp y,&nbsp z){</a></br><a>&nbsp &nbsp &nbsp while(true){</a></br><a>&nbsp &nbsp &nbsp &nbsp &nbsp return&nbsp (y){</a></br><a>&nbsp &nbsp &nbsp }</a></br><a style="background-color:red;">&nbsp &nbsp &nbsp if((n==s[3])){</a></br><a>&nbsp &nbsp &nbsp &nbsp return&nbsp (-(s)){</a></br><a>&nbsp &nbsp &nbsp }</a></br><a style="background-color:red;">&nbsp &nbsp &nbsp if(false){</a></br><a>&nbsp &nbsp &nbsp &nbsp return&nbsp false;</a></br><a>&nbsp &nbsp &nbsp }</a></br><a>}</a></br><a>let&nbsp n1=8;</a></br>'
        );
    });
    it('nine', () => {
        assert.equal(
            start('let t=[1,2,3,true,\'hello\'];\n' +
                'let n =\'hello\';\n' +
                'let s=[1,s,\'hello\'];\n' +
                'function foo(x, y, z){\n' +
                '    let a = [1,y,\'hello\'];\n' +
                '    let b=a[1];\n' +
                '    while(true){\n' +
                '     return b;\n' +
                '   }\n' +
                '   if(n==s[2]){\n' +
                '    return -s;\n' +
                '   }\n' +
                '   if(a[2]){\n' +
                '    return false;\n' +
                '   }\n' +
                '}\n' +
                'let n1=8;','1,2,3'),
            '<a>let&nbsp t=[1,2,3,true,\'hello\'];</a></br><a>let&nbsp n&nbsp =\'hello\';</a></br><a>let&nbsp s=[1,s,\'hello\'];</a></br><a>function&nbsp foo(x,&nbsp y,&nbsp z){</a></br><a>&nbsp &nbsp &nbsp while(true){</a></br><a>&nbsp &nbsp &nbsp &nbsp &nbsp return&nbsp (y){</a></br><a>&nbsp &nbsp &nbsp }</a></br><a style="background-color:green;">&nbsp &nbsp &nbsp if((n==s[2])){</a></br><a>&nbsp &nbsp &nbsp &nbsp return&nbsp (-(s)){</a></br><a>&nbsp &nbsp &nbsp }</a></br><a style="background-color:green;">&nbsp &nbsp &nbsp if(hello){</a></br><a>&nbsp &nbsp &nbsp &nbsp return&nbsp false;</a></br><a>&nbsp &nbsp &nbsp }</a></br><a>}</a></br><a>let&nbsp n1=8;</a></br>'
        );
    });
    it('ten', () => {
        assert.equal(
            start('let t=[1,2,3,true,\'hello\'];\n' +
                'let n =false;\n' +
                'let s=[1,s,false];\n' +
                'function foo(x, y, z){\n' +
                '   if(n==s[2]){\n' +
                '    return -s;\n' +
                '   }\n' +
                '}\n' +
                'let n1=8;','1,2,3'),
            '<a>let&nbsp t=[1,2,3,true,\'hello\'];</a></br><a>let&nbsp n&nbsp =false;</a></br><a>let&nbsp s=[1,s,false];</a></br><a>function&nbsp foo(x,&nbsp y,&nbsp z){</a></br><a style="background-color:green;">&nbsp &nbsp &nbsp if((n==s[2])){</a></br><a>&nbsp &nbsp &nbsp &nbsp return&nbsp (-(s)){</a></br><a>&nbsp &nbsp &nbsp }</a></br><a>}</a></br><a>let&nbsp n1=8;</a></br>'
        );
    });
    it('eleven', () => {
        assert.equal(
            start('let t=[1,2,3,true,\'hello\'];\n' +
                'let n =false;\n' +
                'let s=[1,s,false];\n' +
                'function foo(x, y, z){\n' +
                '   if(n==s[2]){\n' +
                '    return -s;\n' +
                '   }\n' +
                '   else if(1>t[2]){\n' +
                '     return t[3];\n' +
                '   }\n' +
                '   else{\n' +
                '    return 4;\n' +
                '   }\n' +
                '}\n' +
                'let n1=8;','1,2,3'),
            '<a>let&nbsp t=[1,2,3,true,\'hello\'];</a></br><a>let&nbsp n&nbsp =false;</a></br><a>let&nbsp s=[1,s,false];</a></br><a>function&nbsp foo(x,&nbsp y,&nbsp z){</a></br><a style="background-color:green;">&nbsp &nbsp &nbsp if((n==s[2])){</a></br><a>&nbsp &nbsp &nbsp &nbsp return&nbsp (-(s)){</a></br><a>&nbsp &nbsp &nbsp }</a></br><a style="background-color:red;">&nbsp &nbsp &nbsp else&nbsp if((1>t[2])){</a></br><a>&nbsp &nbsp &nbsp &nbsp &nbsp return&nbsp (t[3]){</a></br><a>&nbsp &nbsp &nbsp }</a></br><a>&nbsp &nbsp &nbsp else{</a></br><a>&nbsp &nbsp &nbsp &nbsp return&nbsp 4;</a></br><a>&nbsp &nbsp &nbsp }</a></br><a>}</a></br><a>let&nbsp n1=8;</a></br>'
        );
    });
});
/*
it('is parsing a simple variable declaration correctly', () => {
    assert.equal(
        start()
    );
});
*/