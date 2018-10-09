use wasm_bindgen::prelude::*;
/*
    t = time
    v = velocity
    p = position
    i = initialTime
    n = target 
    s = speed
    tl = top limit
    bl = bottom limit
 */

#[wasm_bindgen]
//returns n
pub fn ball_traj_pos(t:f64, v:f64, p:f64, i:f64) -> f64 {
    if v == 0.0 {
        p
    } else {
        p + ((t - i) * v)
    }
}

#[wasm_bindgen]
//returns t
pub fn ball_traj_time(n:f64, v:f64, p:f64, i:f64) -> f64 {
    if v == 0.0 {
        i
    } else {
        i + ((n - p)/v)
    }
}


#[wasm_bindgen]
//returns n
pub fn paddle_traj_pos(t:f64, s:f64, p:f64, i:f64, bl:f64, tl:f64) -> f64 {
    if s == 0.0 {
        p
    } else {
        let value:f64 = p + ((t - i) * s);

        clamp(bl, tl, value)
    }
}


#[wasm_bindgen]
//returns t
pub fn paddle_traj_time(n:f64, s:f64, p:f64, i:f64) -> f64 {
    if s == 0.0 {
        i
    } else {
        i + ((n - p)/s)
    }
}
#[wasm_bindgen]
//returns n
pub fn ai_traj_pos(previous_y: f64, ball_y:f64, bl:f64, tl:f64) -> f64 {
    let max_distance = 4.5;
    //limit paddle to stay on screen
    let target = clamp(bl, tl, ball_y);
    //limit update distance to keep it winable
    let diff = clamp(-max_distance, max_distance, target - previous_y);

    previous_y + diff
    
}

//Helper Utils
fn clamp(min:f64, max:f64, val:f64) -> f64 {
    if val < min {
        min
    } else if val > max {
        max
    } else {
        val 
    }
}
