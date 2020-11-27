var number_patt = /^[0-9]+$/
var float_patt = /^[0-9]+[.][0-9]+$/
var range_patt = /[(][0-9]+[,][0-9]+[)]$/
var single_val_patt = /[(][0-9.]+[)]$/
exports.check_int = (str)=>{
    if(str.match(number_patt)){
        return true;
    }
    return false;
}

exports.check_float = (str)=>{
    if(str.match(float_patt)){
        return true;
    }
    return false;
}

exports.parse_range = (rng_str)=>{
    if(rng_str==null || rng_str==undefined) return [-1,-1];
    if(rng_str.match(range_patt)){
        var sliced = rng_str.slice(1,rng_str.length-1);
        var tkns = sliced.split(",");
        if(tkns.length!=2){
            return [-1,-1];
        }
        if(this.check_int(tkns[0]) && this.check_int(tkns[1])){
            return [parseInt(tkns[0]),parseInt(tkns[1])];
        }
    }
    
    return [-1,-1];
}

exports.parse_scale = (scl_str)=>{
    if(scl_str==null || scl_str==undefined) return -1;
    if(scl_str.match(single_val_patt)){
        var sliced = scl_str.slice(1,scl_str.length-1);
        var is_int = this.check_int(sliced);
        if(is_int){
            var scale = parseInt(sliced,10);
            if(scale==0) return -1;
            return scale;
        }
        var is_float = this.check_float(sliced);
        if(is_float){
            var scale = parseFloat(sliced);
            if(scale<=0) return -1;
            return scale;
        }
    }
    
    return -1;
}

exports.parse_frame_rate = (frame_str)=>{
    
    if(frame_str.match(single_val_patt)){
        var sliced = frame_str.slice(1,frame_str.length-1);
        var is_int = this.check_int(sliced);
        if(is_int){
            var frame_rate = parseInt(sliced,10);
            if(frame_rate==0) return -1;
            return frame_rate;
        }
        
    }
    
    return -1;
}

exports.parse_img = (img_str)=>{
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

exports.check_gif_size = (size_str)=>{
    var tokens = size_str.trim().split(" ");
    if(tokens[0]=='size'){
        let [size_x,size_y] = this.parse_range(tokens[1]);
        if(size_x==-1){
            throw "Error in size parameters, expected positive integers for size or missing '(' ')' "
        }
        return [size_x,size_y];
    }else{
        return [-1,-1];
    }

}

exports.check_frame_rate = (frame_str)=>{
    var tokens = frame_str.trim().split(" ");
    if(tokens[0]=='frame_rate'){
        let fr = this.parse_frame_rate(tokens[1]);
        if(fr==-1){
            throw "Error in frame rate parameter, expected positive integer or missing '(' ')' ";
        }
        return fr;
    }
    return -1;
}
