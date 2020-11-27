
const {createCanvas,Image} = require('canvas')
const {writeFile, readFile, readFileSync} = require('fs');
const Gif = require('gif-encoder-2')
const path = require('path')
    

var process_instructions = async(instructions,output,size_x=800,size_y=800,frame_rate=-1)=>{
    
    var gif = new Gif(size_x,size_y);
    gif.setDelay(50)
    gif.start();
    if(frame_rate!=-1) gif.setFrameRate(frame_rate);
    for(var i=0;i<instructions.length;i++){
        var instruction = instructions[i];
        var images = instruction.flip_images;
        var left = instruction.left_page_index;
        var right = instruction.right_page_index;
        console.log("Making pages ",left,right)
        var can = createCanvas(size_x,size_y);
        var ctx = can.getContext('2d')
        await new Promise(async(resolve1,reject1)=>{

            for(const flipimg of images){
                var imgname = flipimg.name;
                var img_path = path.join(process.cwd(),'/',imgname);
                    
                await new Promise((resolve2,reject2)=>{
                    const img = new Image();
                    img.onload = ()=>{
                        console.log("image loaded")
                        ctx.drawImage(img,flipimg.pos_x,flipimg.pos_y,img.width*flipimg.scale,img.height*flipimg.scale);
                        // gif.addFrame(ctx);
                        resolve2();
                    }
                    img.src = img_path;
                })
            }

            console.log("adding frames")
            for(var j=left;j<=right;j++){
                gif.addFrame(ctx)        
            }
            resolve1();
        })
        
    }
    gif.finish();

    const file = gif.out.getData();
    writeFile(path.join(process.cwd()+'/'+output),file,err=>{
        if(!err){
            console.log("GIF generated!!!")
        }
    })
}

exports.process_instructions = process_instructions