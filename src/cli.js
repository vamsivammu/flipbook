const {tokenize} = require('../src/tokenize')
const {process_instructions} = require('../src/flipbook')

var cli = (args)=>{
    console.log("Processing..")
    args.splice(0,2);

    var instructions = tokenize(args);
    process_instructions(instructions,args[2]);
}



exports.cli = cli;