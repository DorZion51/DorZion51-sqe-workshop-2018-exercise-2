import * as esprima from 'esprima';
let locals=new Map();
let assignments=new Map();
let conditions=new Map();
let returns=new Map();
let c=0,r=0;
let lines=[];

const parseCode = (codeToParse) => {
    lines=codeToParse.split('\n');
    return esprima.parseScript(codeToParse,{loc:true});
};


function start(parsed){
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
        if(assignments.has(left.name)){
            return assignments.get(left.name);
        }
        if(locals.has(left.name)){
            return locals.get(left.name);
        }
        return left.name;
    }
    else{
        return continueLeftRight(left);
    }
}

function changeRight(dec) {
    let right=dec;
    if(right.type=='BinaryExpression'){
        return '('+changeLeft(right.left)+right.operator+changeRight(right.right)+')';
    }
    if(right.type=='Identifier'){
        if(assignments.has(right.name)){
            return assignments.get(right.name);
        }
        if(locals.has(right.name)){
            return locals.get(right.name);
        }
        return right.name;
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
    conditions.set('condition'+c,changeLeft(test.left)+test.operator+changeLeft(test.right));
    lines[test.loc.start.line-1]=lines[test.loc.start.line-1].slice(0,test.loc.start.column)+conditions.get('condition'+c)+'){';
    c++;
}

function returnState(stat) {
    returns.set('return'+r,changeLeft(stat.argument.left)+stat.argument.operator+changeRight(stat.argument.right));
    lines[stat.loc.start.line-1]=lines[stat.loc.start.line-1].slice(0,stat.loc.start.column)+'return '+returns.get('return'+r);
    r++;
}

function continueLeftRight(dec) {
    if(dec.type=='MemberExpression'){
        return dec.object.name+'['+Exp(dec.property)+']';
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
    if(assignments.has(exp.name)){
        return assignments.get(exp.name);
    }
    if(locals.has(exp.name)){
        return locals.get(exp.name);
    }
    return exp.name;
}


export {parseCode,start};
