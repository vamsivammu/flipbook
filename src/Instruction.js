class Instruction{
    left_page_index;
    right_page_index;
    flip_images;
    constructor(left,right){
        this.left_page_index = left;
        this.right_page_index = right;
        this.flip_images = [];
    }
    push_flip_image(flipimg){
        this.flip_images.push(flipimg);
    }
}

exports.Instruction = Instruction;