const fs = require('fs')
const { Instruction } = require('./Instruction');
const { FlipImage } = require('./FlipImage')
const {check_int,parse_img,parse_range,parse_scale, check_gif_size, check_frame_rate} = require('./parser')
const path = require('path')

var err =  (line_no,exp)=>{
    return "Error at "+line_no + ". Expected "+exp;
}


var tokenize = (args)=>{
    var filename = args[0];
    var filepath = path.join(process.cwd()+ '/' + filename);
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
        var line_ind = 0;
        let [size_x,size_y] = check_gif_size(lines[0]);
        if(size_x!=-1){
            line_ind++;
        }else{
            size_x=800;size_y=800;
        }
        let fr = check_frame_rate(lines[line_ind]);
        if(fr!=-1){
            line_ind++;
        }
        while(line_ind<lines.length){
            var line = lines[line_ind];
            line = line.trim();
            var tokens = line.split(" ");
            if(line==''){
                line_ind++;
                continue;
            }
            if(tokens.length!=3){
                throw err(line_ind+1,"page (x,y) number_of_images");
            }
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
        if(instructions.length==0){
            throw "expected atleast one page with one image";
        }
        return [instructions,size_x,size_y,fr];

    
}

exports.tokenize = tokenize;