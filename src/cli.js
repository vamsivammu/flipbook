const {tokenize} = require('../src/tokenize')
const {process_instructions} = require('../src/flipbook')

var cli = (args)=>{
    console.log("Processing..")
    args.splice(0,2);

    let [instructions,size_x,size_y,fr] = tokenize(args);
    process_instructions(instructions,args[2],size_x,size_y,fr);
}



exports.cli = cli;