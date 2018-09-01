
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

#[no_mangle]
//returns n
pub fn ball_traj_pos(t:f64, v:f64, p:f64, i:f64) -> f64 {
    if v == 0.0 {
        p
    } else {
        p + ((t - i) * v)
    }
}

#[no_mangle]
//returns t
pub fn ball_traj_time(n:f64, v:f64, p:f64, i:f64) -> f64 {
    if v == 0.0 {
        i
    } else {
        i + ((n - p)/v)
    }
}


#[no_mangle]
//returns n
pub fn paddle_traj_pos(t:f64, s:f64, p:f64, i:f64, bl:f64, tl:f64) -> f64 {
    if s == 0.0 {
        p
    } else {
        let value:f64 = p + ((t - i) * s);

        clamp(bl, tl, value)
    }
}

#[no_mangle]
//returns t
pub fn paddle_traj_time(n:f64, s:f64, p:f64, i:f64) -> f64 {
    if s == 0.0 {
        i
    } else {
        i + ((n - p)/s)
    }
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
