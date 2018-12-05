import * as esprima from 'esprima';
let locals=new Map();
let assignments=new Map();
let conditions=new Map();
let returns=new Map();
let c=0,r=0,p=0;
let lines=[];
let inputv=new Map();
let params=new Map();


const parseCode = (codeToParse) => {
    lines=codeToParse.split('\n');
    return esprima.parseScript(codeToParse,{loc:true});
};

function reset() {
    locals=new Map();
    assignments=new Map();
    conditions=new Map();
    returns=new Map();
    c=0,r=0,p=0;
    inputv=new Map();
    params=new Map();
}
function start(parsed,inputVector){
    reset();
    let func=extractFunction(parsed);
    getInputVector(inputVector);
    buildDataStructure(func.body.body);
    return lines;
    //let x=2;
}


function extractFunction(parsed) {
    for (let i = 0; i <parsed.body.length ; i++) {
        if(parsed.body[i].type=='FunctionDeclaration'){
            setParams(parsed.body[i]);
            return parsed.body[i];
        }
        if(parsed.body[i].type=='VariableDeclaration'){
            globalsVector(parsed.body[i].declarations);
        }
        if(parsed.body[i].type=='ExpressionStatement'){
            assExp(parsed.body[i].expression);
        }
    }
}

function setParams(func) {
    for (let i = 0; i <func.params.length ; i++) {
        params.set(p,func.params[i].name);
        p++;
    }
}
function buildDataStructure(funcArray) {
    for (let i = 0; i <funcArray.length ; i++) {
        if(funcArray[i].type=='VariableDeclaration'){
            varDec(funcArray[i].declarations);
            lines[funcArray[i].loc.start.line-1]='~';
        }
        else if(funcArray[i].type=='ExpressionStatement'){
            assExp(funcArray[i].expression);
            lines[funcArray[i].loc.start.line-1]='~';
        }
        else {
            statement(funcArray[i]);
        }
    }
}

function varDec(dec) {
    for (let i = 0; i <dec.length ; i++) {
        if(dec[i].init.type=='Literal') {
            locals.set(dec[i].id.name,dec[i].init.value);
        }
        else if(dec[i].init.type=='UnaryExpression'){
            locals.set(dec[i].id.name,dec[i].init.operator+unaryExp(dec[i]));
        }
        else if(dec[i].init.type=='BinaryExpression'){
            locals.set(dec[i].id.name,changeLeft(dec[i].init.left)+dec[i].init.operator+changeRight(dec[i].init.right));
        }
        else{
            ArrayExp(dec[i]);
        }
    }
}

function ArrayExp(exp) {
    for (let j = 0; j <exp.init.elements.length ; j++) {
        let val=exp.init.elements[j].value;
        if(inputv.has(val)){
            val=inputv.get(val);
        }
        locals.set(exp.id.name+'['+j+']',val);
    }
}

function changeLeft(dec) {
    let left=dec;
    if(left.type=='BinaryExpression'){
        return '('+changeLeft(left.left)+left.operator+changeRight(left.right)+')';
    }
    if(left.type=='Identifier'){
        return ' '+identifer(left.name)+' ';
    }
    else{
        return ' '+continueLeftRight(left)+' ';
    }
}

function identifer(name) {
    /*if(inputv.has(name)){
        return inputv.get(name);
    }*/
    if(assignments.has(name)){
        return assignments.get(name);
    }
    if(locals.has(name)){
        return locals.get(name);
    }
    return name;
}
function changeRight(dec) {
    let right=dec;
    if(right.type=='BinaryExpression'){
        return '('+changeLeft(right.left)+right.operator+changeRight(right.right)+')';
    }
    if(right.type=='Identifier'){
        return ' '+identifer(right.name)+' ';
    }
    else{
        return continueLeftRight(right);
    }
}

function unaryExp(dec) {
    let unary='';
    try{
        unary=dec.init.argument;
    }catch (e) {
        unary=dec;
    }
    if(unary.type=='Literal'){
        return unary.value;
    }
    else if(unary.type=='BinaryExpression'){
        return '('+changeLeft(unary.left)+unary.operator+changeRight(unary.right)+')';
    }
    else{//member
        return continueLeftRight(dec);
    }
}

function assExp(exp) {
    checkAassLocals(exp);
    if(exp.type=='AssignmentExpression'){
        if(exp.left.type=='MemberExpression'){
            assExp2(exp);
        }
        else{
            if(exp.right.type=='UnaryExpprssion'){
                changeIfGlobal(exp.left.name,exp.right.operator+unaryExp(exp.right));
                assignments.set(exp.left.name,exp.right.operator+unaryExp(exp.right));
            }
            else if(exp.right.type=='BinaryExpression'){
                changeIfGlobal(exp.left.name,changeLeft(exp.right.left)+exp.right.operator+changeRight(exp.right.right));
                assignments.set(exp.left.name,changeLeft(exp.right.left)+exp.right.operator+changeRight(exp.right.right));
            }
        }
    }

}

function assExp2(exp) {
    let pro=getProperty(exp.left.property);
    pro=evaluation(pro);
    if(exp.right.type=='UnaryExpprssion'){
        changeIfGlobal(exp.left.object.name+'['+pro+']',exp.right.operator+unaryExp(exp.right));
        assignments.set(exp.left.object.name+'['+pro+']',exp.right.operator+unaryExp(exp.right));
    }
    else if(exp.right.type=='BinaryExpression'){
        changeIfGlobal(exp.left.object.name+'['+pro+']',changeLeft(exp.right.left)+exp.right.operator+changeRight(exp.right.right));
        assignments.set(exp.left.object.name+'['+pro+']',changeLeft(exp.right.left)+exp.right.operator+changeRight(exp.right.right));
    }
    else if(exp.right.type=='Literal'){
        changeIfGlobal(exp.left.object.name+'['+pro+']',exp.right.value);
        assignments.set(exp.left.object.name+'['+pro+']',exp.right.value);
    }
    else{
        changeIfGlobal(exp.left.object.name+'['+pro+']',exp.right.name);
        assignments.set(exp.left.object.name+'['+pro+']',exp.right.name);
    }
}

function getProperty(pro) {
    return changeRight(pro);
}
function checkAassLocals(exp) {
    if(assignments.has(exp.left.name))
        assignments.set(exp.left.name,locals.get(exp.left.name));
}

function statement(stat) {
    if(stat.type=='ReturnStatement'){
        returnState(stat);
    }
    else {
        if(stat.test.type=='BinaryExpression')
            testStat(stat.test);
        else{testStatB(stat.test);}
        if(stat.type=='WhileStatement'){
            buildDataStructure(stat.body.body);
        }
        else {
            statementB(stat);
        }
    }
}

function statementB(stat) {
    buildDataStructure(stat.consequent.body);
    if(stat.alternate!=null){
        if (stat.alternate.type == 'BlockStatement') {
            buildDataStructure(stat.alternate.body);
        } else {
            statement(stat.alternate);
        }
    }
}

function testStat(test) {
    let left=changeLeft(test.left);
    let right=changeRight(test.right);
    let flag=true;
    let le=clear(left);
    let ri=clear(right);
    conditions.set('condition'+c,left+test.operator+right);
    if(evaluation(conditions.get('condition'+c))){
        lines[test.loc.start.line-1]='@'+lines[test.loc.start.line-1].slice(0,test.loc.start.column)+conditions.get('condition'+c).replace(/\s+/g, '')+'){';
    }
    else{
        lines[test.loc.start.line-1]='!'+lines[test.loc.start.line-1].slice(0,test.loc.start.column)+conditions.get('condition'+c).replace(/\s+/g, '')+'){';
        flag=false;
    }if(checkass(le,ri)){
        changeLine3(test.loc.start.line-1,test.loc.start.column,test.operator,le,ri,flag);
    }
    else if(checkLocal(le,ri)){
        changeLine(test.loc.start.line-1,test.loc.start.column,test.operator,le,ri,flag);
    }c++;
}

function clear(str) {
    try {
        return str.replace(/\s+/g, '');
    }catch (e) {
        return str;
    }
}
function changeLine3(line,col,op,left,right,flag) {
    if(assignments.has(left)&&assignments.has(right)){
        if(flag) {
            lines[line] = lines[line].slice(0, col+1) + assignments.get(left) + op + assignments.get(right) + '){';
            return;
        }
        lines[line] = lines[line].slice(0, col+1) + assignments.get(left) + op + assignments.get(right) + '){';
    }
    else{
        changeLine4(line,col,op,left,right,flag);
    }
}

function changeLine4(line,col,op,left,right,flag) {
    if(assignments.has(left)){
        if(flag){
            lines[line]=lines[line].slice(0,col+1)+assignments.get(left)+op+right+'){';
            return;
        }
        lines[line]=lines[line].slice(0,col+1)+assignments.get(left)+op+right+'){';
    }
    else{
        if(flag) {
            lines[line] = lines[line].slice(0, col+1) + left + op + assignments.get(right) + '){';
            return;
        }
        lines[line] = + lines[line].slice(0, col+1) + left + op + assignments.get(right) + '){';
    }
}

function changeLine(line,col,op,left,right,flag) {
    if(locals.has(left)&&locals.has(right)){
        if(flag) {
            lines[line] =lines[line].slice(0, col+1) + locals.get(left) + op + locals.get(right) + '){';
            return;
        }
        lines[line] = lines[line].slice(0, col+1) + locals.get(left) + op + locals.get(right) + '){';
    }
    else{
        changeLine2(line,col,op,left,right,flag);
    }
}

function changeLine2(line,col,op,left,right,flag) {
    if(locals.has(left)){
        if(flag){
            lines[line]=lines[line].slice(0,col+1)+locals.get(left)+op+right+'){';
            return;
        }
        lines[line]=lines[line].slice(0,col+1)+locals.get(left)+op+right+'){';
    }
    else{
        if(flag) {
            lines[line]= lines[line].slice(0, col+1) + left + op + locals.get(right) + '){';
            return;
        }
        lines[line] =lines[line].slice(0, col+1) + left + op + locals.get(right) + '){';
    }
}

function checkLocal(vari,vari2) {
    if(locals.has(vari)||locals.has(vari2))
        return true;
    return false;
}

function checkass(vari,vari2) {
    if(assignments.has(vari)||assignments.has(vari2))
        return true;
    return false;
}

function testStatB(test) {
    if(test.type=='MemberExpression'){
        let arr=continueLeftRight(test);
        conditions.set('condition'+c,arr);
    }
    if(test.type=='Identifier'){
        let id=identifierExp(test);
        conditions.set('condition'+c,id);
    }
    if(test.type=='UnaryExpression'){
        let unary=test.operator+unaryExp(test.argument);
        conditions.set('condition'+c,unary);
    }
    if(evaluation(conditions.get('condition'+c))){
        lines[test.loc.start.line-1]='@'+lines[test.loc.start.line-1].slice(0,test.loc.start.column)+conditions.get('condition'+c)+'){';
    }
    else{
        lines[test.loc.start.line-1]='!'+lines[test.loc.start.line-1].slice(0,test.loc.start.column)+conditions.get('condition'+c).replace(/\s+/g, '')+'){';
    }c++;
}

function returnState(stat) {
    if(stat.argument.type=='Identifier'){
        returns.set('return'+r,identifer(stat.argument.name));
    }
    else if(stat.argument.type=='Literal'){
        returns.set('return'+r,stat.argument.value);
    }
    else if(stat.argument.type=='BinaryExpression'){
        returns.set('return'+r,changeLeft(stat.argument.left)+stat.argument.operator+changeRight(stat.argument.right));
    }
    else if(stat.argument.type=='UnaryExpression'){
        returns.set('return'+r,stat.argument.operator+unaryExp(stat.argument));
    }
    else{
        returns.set('return'+r,continueLeftRight(stat.argument));
    }
    lines[stat.loc.start.line-1]=lines[stat.loc.start.line-1].slice(0,stat.loc.start.column)+'return '+returns.get('return'+r).replace(/\s+/g, '');
    r++;
}

function continueLeftRight(dec) {
    if(dec.type=='MemberExpression'){
        let some= dec.object.name+'['+evaluation(Exp(dec.property))+']';
        some=Members(some);
        //some=getValueinputVector(some);
        return some;
    }
    if(dec.type=='Identifier'){
        return identifer(dec.name);
    }
    return dec.value;
}

function Members(exp) {
    if(assignments.has(exp)){
        return assignments.get(exp);
    }
    if(locals.has(exp)){
        return locals.get(exp);
    }
    return exp;
}

function Exp(exp) {
    if(exp.type=='BinaryExpression'){
        return '('+changeLeft(exp.left)+exp.operator+changeRight(exp.right)+')';
    }
    if(exp.type=='UnaryExprssion'){
        return unaryExp(exp);
    }
    if(exp.type=='Identifier'){
        return identifierExp(exp);
    }
    if(exp.type=='Literal'){
        return exp.value;
    }
}

function identifierExp(exp) {
    if(inputv.has(exp.name)){
        return inputv.get(exp.name);
    }
    if(assignments.has(exp.name)){
        return assignments.get(exp.name);
    }
    if(locals.has(exp.name)){
        return locals.get(exp.name);
    }
    return exp.name;
}

/////////////////////////////////
////////part b eval()///////////
///////////////////////////////

function getInputVector(inp) {
    let exp=inp.body[0].expression.expressions;
    for (let i = 0; i <exp.length ; i++) {
        if(exp[i].type=='Literal'){
            inputv.set(params.get(i),exp[i].value);
        }
        else if(exp[i].type=='ArrayExpression'){
            for (let j = 0; j <exp[i].elements.length ; j++) {
                inputv.set(params.get(i)+'['+j+']',exp[i].elements[j].value);
            }
        }
        else{
            getInputVector2(i,exp[i]);
        }
    }
}

function getInputVector2(i,exp) {
    if(exp.type=='Identifier'){
        inputv.set(params.get(i),exp.name);
    }
    else {
        inputv.set(params.get(i),changeRight(exp));
    }
}
function globalsVector(dec) {
    for (let i = 0; i <dec.length ; i++) {
        if(dec[i].init.type=='ArrayExpression'){
            for (let j = 0; j <dec[i].init.elements.length ; j++) {
                inputv.set(dec[i].id.name+'['+j+']',dec[i].init.elements[j].value);
            }
        }
        else{
            inputv.set(dec[i].id.name,dec[i].init.value);
        }
    }
}
function evaluation(str) {
    try {
        str = str.split(' ');
        let str2 = '';
        for (let i = 0; i < str.length; i++) {
            if (inputv.has(str[i])) {
                str2 = str2 + inputv.get(str[i]);
            }
            else{
                str2=str2+checkother(str[i]);
            }
        }
        return eval(str2);
    }
    catch (e) {
        return evaluation2(str);
    }
}

function checkother(str) {
    if(assignments.has(str)){
        return assignments.get(str);
    }
    if(locals.has(str)){
        return locals.get(str);
    }
    return str;
}


function evaluation2(str) {
    if(isNaN(str)){
        let str2 = '';
        let str3 = '';
        for (let i = 0; i < str.length; i++) {
            if (inputv.has(str[i])) {
                str2 = inputv.get(str[i]);
            }
            if (str[i].includes('==')) {
                str3 = str[i].substring(2);
            }
        }
        return str2 == str3;
    }
    else {
        return str;
    }
}

function changeIfGlobal(str,str1) {
    if(inputv.has(str))
        inputv.set(str,str1);
}

export {parseCode,start};
