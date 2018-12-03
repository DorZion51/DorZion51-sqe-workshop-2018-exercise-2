import * as esprima from 'esprima';
let locals=new Map();
let assignments=new Map();
let conditions=new Map();
let returns=new Map();
let c=0,r=0;
let lines=[];
let inputv=new Map();


const parseCode = (codeToParse) => {
    lines=codeToParse.split('\n');
    return esprima.parseScript(codeToParse,{loc:true});
};

function reset() {
    locals=new Map();
    assignments=new Map();
    conditions=new Map();
    returns=new Map();
    c=0,r=0;
    inputv=new Map();
}
function start(parsed,inputVector){
    reset();
    getInputVector(inputVector);
    let func=extractFunction(parsed);
    buildDataStructure(func.body.body);
    return lines;
    //let x=2;
}

function extractFunction(parsed) {
    for (let i = 0; i <parsed.body.length ; i++) {
        if(parsed.body[i].type=='FunctionDeclaration'){
            return parsed.body[i];
        }
        if(parsed.body[i].type=='VariableDeclaration'){
            globalsVector(parsed.body[i].declarations);
        }
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

    }
}

function changeLeft(dec) {
    let left=dec;
    if(left.type=='BinaryExpression'){
        return '('+changeLeft(left.left)+left.operator+changeRight(left.right)+')';
    }
    if(left.type=='Identifier'){
        return identifer(left.name);
    }
    else{
        return continueLeftRight(left);
    }
}

function identifer(name) {
    if(inputv.has(name)){
        return inputv.get(name);
    }
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
        return identifer(right.name);
    }
    else{
        return continueLeftRight(right);
    }
}

function unaryExp(dec) {
    let unary=dec.init.argument;
    if(unary.type=='Literal'){
        return unary.value;
    }
    else if(unary.type=='BinaryExpression'){
        return '('+changeLeft(unary.left)+unary.operator+changeRight(unary.right)+')';
    }
}

function assExp(exp) {
    checkAassLocals(exp);
    if(exp.type=='AssignmentExpression'){

        if(exp.right.type=='UnaryExpprssion'){
            assignments.set(exp.left.name,exp.right.operator+unaryExp(exp.right));
        }
        else if(exp.right.type=='BinaryExpression'){
            assignments.set(exp.left.name,changeLeft(exp.right.left)+exp.right.operator+changeRight(exp.right.right));
        }
    }

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
        testStat(stat.test);
        if(stat.type=='WhileStatement'){
            buildDataStructure(stat.body.body);
        }
        else {
            buildDataStructure(stat.consequent.body);
            if(stat.alternate.type=='BlockStatement'){
                buildDataStructure(stat.alternate.body);
            } else{
                statement(stat.alternate);
            }
        }//if
    }
}

function testStat(test) {
    let left=changeLeft(test.left);
    let right=changeRight(test.right);
    conditions.set('condition'+c,left+test.operator+right);
    if(eval(conditions.get('condition'+c))){
        lines[test.loc.start.line-1]='@'+lines[test.loc.start.line-1].slice(0,test.loc.start.column)+conditions.get('condition'+c)+'){'+'//this is green';
    }
    else{
        lines[test.loc.start.line-1]='!'+lines[test.loc.start.line-1].slice(0,test.loc.start.column)+conditions.get('condition'+c)+'){'+'//this is red';
    }
    c++;
}

function returnState(stat) {
    returns.set('return'+r,changeLeft(stat.argument.left)+stat.argument.operator+changeRight(stat.argument.right));
    lines[stat.loc.start.line-1]=lines[stat.loc.start.line-1].slice(0,stat.loc.start.column)+'return '+returns.get('return'+r);
    r++;
}

function continueLeftRight(dec) {
    if(dec.type=='MemberExpression'){
        let some= dec.object.name+'['+Exp(dec.property)+']';
        some=getValueinputVector(some);
        return some;
    }
    return dec.value;
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
        if(exp[i].right.type=='ArrayExpression'){
            for (let j = 0; j <exp[i].right.elements.length ; j++) {
                inputv.set(exp[i].left.name+'['+j+']',exp[i].right.value);
            }
        }
        else{
            inputv.set(exp[i].left.name,exp[i].right.value);
        }
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

function getValueinputVector(exp) {
    if(inputv.has(exp)){
        return inputv.get(exp);
    }
    return exp;
}

export {parseCode,start};
