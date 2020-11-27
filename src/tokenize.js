const fs = require('fs')
const readLine = require('readline');
const { Instruction } = require('./Instruction');
const { FlipImage } = require('./FlipImage')
const path = require('path')
var number_patt = /^[0-9]+$/
var float_patt = /^[0-9]+[.][0-9]+$/
var err =  (line_no,exp)=>{
    return "Error at "+line_no + ". Expected "+exp;
}

var check_int = (str)=>{
    if(str.match(number_patt)){
        return true;
    }
    return false;
}

var check_float = (str)=>{
    if(str.match(float_patt)){
        return true;
    }
    return false;
}

var parse_range = (rng_str)=>{
    var sliced = rng_str.slice(1,rng_str.length-1);
    var tkns = sliced.split(",");
    if(tkns.length!=2){
        return [-1,-1];
    }
    if(check_int(tkns[0]) && check_int(tkns[1])){
        return [parseInt(tkns[0]),parseInt(tkns[1])];
    }
    return [-1,-1];
}

var parse_scale = (scl_str)=>{
    var sliced = scl_str.slice(1,scl_str.length-1);
    var is_int = check_int(sliced);
    if(is_int){
        var scale = parseInt(sliced,10);
        if(scale==0) return -1;
        return scale;
    }
    var is_float = check_float(sliced);
    if(is_float){
        var scale = parseFloat(sliced);
        if(scale<=0) return -1;
        return scale;
    }
    return -1;
}

var parse_img = (img_str)=>{
    var img_name_tokens = img_str.split('.');
    if(img_name_tokens.length!=2){
        return -1;
    }
    var ext = img_name_tokens[1];
    if(ext=='jpg' || ext=='jpeg' || ext=='png'){
        return img_str;
    }
    return -1;
}

var tokenize = (args)=>{
    var filename = args[0];
    var filepath = path.join(process.cwd() + filename);

    var lines = [];
    var notfound = false;
    try{
        lines = fs.readFileSync(filepath,'utf-8').split('\n').filter(Boolean);
    }catch(e){
        notfound = true;
    }
        if(notfound) throw "File not found";
        var instructions = []
        
        var prevr = -1;
        console.log(filepath)
        
        
        var line_ind = 0;
        while(line_ind<lines.length){
            var line = lines[line_ind];
            line = line.trim();
            var tokens = line.split(" ");
            
            if(tokens[0]=="page"){
                let [left,right] = parse_range(tokens[1]);
                if(left==-1){
                    throw err(line_ind+1,"positive integer page indices")
                }
                if(left!=prevr+1){
                    throw err(line_ind+1,"non overlapping and continuous page indices")
                }
                if(left>right){
                    throw err(line_ind+1,"left index should be less than or equal to right index")
                }
                
                if(!check_int(tokens[2])){
                    throw err(line_ind+1,"number of images to be a positive integer")
                }
                // console.log(tokens)
                var imgs = parseInt(tokens[2],10);
                var inst = new Instruction(left,right);
                line_ind += 1;
                while(imgs>0){
                    var img_tokens = lines[line_ind].trim().split(" ");
                    // console.log(img_tokens)
                    if(img_tokens.length!=5){
                        throw err(line_ind+1,"pos (x,y) scale (z) imagename");
                    }
                    if(img_tokens[0]!='pos' || img_tokens[2]!='scale' || img_tokens[4].length<=0 || img_tokens[3].length<3){
                        throw err(line_ind+1,"pos (x,y) scale (z) imagename");
                    }
                    let [pos_x,pos_y] = parse_range(img_tokens[1]);

                    if(pos_x==-1){
                        throw err(line_ind+1,"positive integers for position of image")
                    }
                    let scale = parse_scale(img_tokens[3]);
                    let img_name = parse_img(img_tokens[4]);
                    if(scale==-1){
                        throw err(line_ind+1,"positive floating number greater than 0 for scale value")
                    }
                    if(img_name==-1){
                        throw err(line_ind+1,"image with jpeg or jpg or png extension")
                    }
                    var flipimg = new FlipImage(img_name,scale,pos_x,pos_y);
                    inst.push_flip_image(flipimg);
                    imgs -= 1;
                    line_ind += 1;
                }
                instructions.push(inst);
                prevr = right;

            }else{
                throw err(line_ind+1,"Page function with left and right indices")
            }
        }
        console.log(instructions.length)
        return instructions;
    

    
}

exports.tokenize = tokenize;