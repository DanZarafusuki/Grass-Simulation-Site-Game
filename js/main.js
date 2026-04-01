var grass_grid = []
var grass_grid_temp = []
const size_x = 125
const size_y = 125
const plot_x = 8
const plot_y = 4
const white_space = 0
const dirs = [
    [0, 1],   // right
    [1, 0],   // down
    [0, -1],  // left
    [-1, 0]   // up
]

const color_matching = ["#241111","#11241a","#008100","#e96c06","#82b7d6","#d894c7"]

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const displayWidth = canvas.clientWidth;
const displayHeight = canvas.clientHeight

const plot_x_adjusted = (displayWidth*plot_x)/1000 
const plot_y_adjusted = (displayHeight*plot_y)/500



const update_speed_skip = 3
const update_speed = 1

for (let i = 0; i < size_x; i++) {
    grass_grid[i] = []
    grass_grid_temp[i] = []
    for (let j = 0; j < size_y; j++) {
        grass_grid[i][j] = 0
}
}
grass_grid[-1] = []
grass_grid[size_x] = []
for (let j = 0; j < size_y; j++) {
        grass_grid[-1][j] = 0
        grass_grid[size_x][j] = 0
}

for (let i = 0; i < size_x; i++) {
        grass_grid[i][-1] = 0
        grass_grid[i][size_y] = 0
}

grass_grid[74][74] = 2

let lastTime = 0;

function gameLoop(time) {
    // // time = high-resolution timestamp (ms)
    // let deltaTime = (time - lastTime) / 1000; // convert to seconds
    // lastTime = time;

    // update(deltaTime);
    //update();
    render();

    requestAnimationFrame(gameLoop);
}




const intervalId = setInterval(() => {
    for(let i = 0; i <update_speed_skip;i++)
    {
        update()
    }
}, update_speed);








function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < size_x; i++) {
        for (let j = 0; j < size_y; j++) {
            print_plot(i,j)
        }
    }
}

function print_plot(i,j) {
    ctx.fillStyle = color_matching[grass_grid[i][j]]
    ctx.fillRect(i*plot_x+white_space,j*plot_y+white_space,plot_x-white_space,plot_y-white_space);
}
requestAnimationFrame(gameLoop);



function update(){
    for (let i = 0; i < size_x; i++) {
        for (let j = 0; j < size_y; j++) {
            update_plot(i,j)
        }
    }
    switch_grass()
}

function switch_grass(){
    for (let i = 0; i < size_x; i++) {
        for (let j = 0; j < size_y; j++) {
            grass_grid[i][j]= grass_grid_temp[i][j]
        }
    }
}

function update_plot(i,j){

    let r = Math.random();

    switch (grass_grid[i][j]) {
        
    case 0: //dirt
        let sprout_threshold = 1 //0.99999
        for (const [dx, dy] of dirs) {
            const ni = i + dx;
            const nj = j + dy;
            if (grass_grid[ni][nj]==2)
                sprout_threshold-=0.006
        }
        if (r>sprout_threshold)
            grass_grid_temp[i][j] =1
        else
            grass_grid_temp[i][j] = grass_grid[i][j]; 
        break;

    case 1:
        let grow_threshold = 0.998
        for (const [dx, dy] of dirs) {
            const ni = i + dx;
            const nj = j + dy;
            if (grass_grid[ni][nj]==2 && grass_grid[ni][nj]==3)
                grow_threshold+=0.0002
        }
        if (r>grow_threshold)
            grass_grid_temp[i][j] =2
        else
            grass_grid_temp[i][j] = grass_grid[i][j]; 
        break;

    case 2:
        let burn_threshold = 0.999999
        for (const [dx, dy] of dirs) {
            const ni = i + dx;
            const nj = j + dy;
            if (grass_grid[ni][nj]==3 )
                burn_threshold-=0.1
        }
        if (r>burn_threshold)
            grass_grid_temp[i][j] =3
        else
            grass_grid_temp[i][j] = grass_grid[i][j]; 
        break;

    case 3:
        let out_threshold = 0.99
        for (const [dx, dy] of dirs) {
            const ni = i + dx;
            const nj = j + dy;
            if (grass_grid[ni][nj]==3 &&  grass_grid[ni][nj]==0)
                out_threshold-=0.1
        }
        if (r>out_threshold)
            grass_grid_temp[i][j] =0
        else
            grass_grid_temp[i][j] = grass_grid[i][j]; 
        break;

    default:
        grass_grid_temp[i][j] = grass_grid[i][j];
        break;
    }

    
    // if (r >0.99)
    //     grass_grid_temp[i][j] = (grass_grid[i][j]+1)%4   
    // else   
    //     grass_grid_temp[i][j] = grass_grid[i][j]; // keep current state
}




var pointerdown =false

var last_event_x
var last_event_y

canvas.addEventListener('click', (event) => {
    last_event_x = event.offsetX
    last_event_y = event.offsetY
    drag_canvas(event)
});


canvas.addEventListener('pointerdown', (event) => {

  pointerdown = true
  last_event_x = event.offsetX
  last_event_y = event.offsetY

});
canvas.addEventListener('pointerup', (event) => {

  pointerdown = false

});
canvas.addEventListener('pointermove', (event) => {

  if( pointerdown)
    drag_canvas(event)

});
    

function drag_accuracy_cal(start_x,start_y,end_x,end_y)
{
    return (Math.abs(start_x - end_x)/plot_x_adjusted) + (Math.abs(start_y-end_y)/plot_y_adjusted)
}

function drag_canvas(event)
{

    let drag_accuracy = drag_accuracy_cal(last_event_x,last_event_y,event.offsetX,event.offsetY)

    
    let x_index 
    let y_index 

    index_list = []
    let diffx = (event.offsetX - last_event_x)/drag_accuracy  
    let diffy = (event.offsetY - last_event_y) /drag_accuracy


    for (let i = 0; i <=drag_accuracy; i++)
    {
        let x_index = Math.floor((last_event_x + diffx*i)/plot_x_adjusted) 
        let y_index = Math.floor((last_event_y +diffy*i)/plot_y_adjusted)
        place_flower(x_index,y_index)
    }



    last_event_x = event.offsetX
    last_event_y = event.offsetY

}

function place_flower(x_index,y_index)
{
    let flower_type
    let r = Math.random();
    if (r>0.5)
        flower_type = 4
    else
        flower_type = 5
    grass_grid[x_index][y_index] = flower_type
}
