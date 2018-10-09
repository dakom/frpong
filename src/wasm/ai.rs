use wasm_bindgen::prelude::*;

static mut WAIT_TICKS:i32 = 0;

#[wasm_bindgen]
pub fn ai_controller(ball_x: f64, 
                     ball_y:f64, 
                     paddle1_x: f64,
                     paddle1_y:f64,
                     paddle2_x: f64,
                     paddle2_y:f64,
                     history_ball_x: f64, 
                     history_ball_y:f64, 
                     history_paddle1_x: f64,
                     history_paddle1_y:f64,
                     history_paddle2_x: f64,
                     history_paddle2_y:f64
                     ) -> i32 
{

    unsafe {
        WAIT_TICKS += 1;
        if WAIT_TICKS < 10 {
            return -1;
        }
        WAIT_TICKS = 0;
    }

    let diff_history_x = ball_x - history_ball_x;
    let diff_history_y = ball_y - history_ball_y;

    if diff_history_x.abs() == 0.0  || diff_history_y.abs() == 0.0 || ball_x < 256.0 {
        return 0;
    }

    let diff_y = ball_y - paddle2_y;

    let controller = get_controller(diff_y);

    controller

    /*

    if diff_y.abs() > 10.0 {
       controller
    } else {
       0
    }
    */
}

fn get_controller (diff:f64) -> i32 {

    //Controller values:
    // 0 = neutral 
    // 1 = down 
    // 2 = up
    //
    if diff < 0.0 { 
       1 
    } else if diff > 0.0 {
       2
    } else {
       0
    }
}
