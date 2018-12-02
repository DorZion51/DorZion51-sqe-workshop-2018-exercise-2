import $ from 'jquery';
import {parseCode,start} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let lines =start(parsedCode);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        write(lines);
    });
});

function write(lines) {
    let str='';
    for (let i = 0; i <lines.length ; i++) {
        if(lines[i]!='~')
            str=str+lines[i]+'\n';
    }
    $('#parsedCode').val(str);
}