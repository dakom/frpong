use wasm_bindgen::prelude::*;

static mut BALL_DELAY_TICKS:i32 = 0;

#[wasm_bindgen]
pub fn ai_controller(
                     ball_radius:f64,
                     paddle_height: f64,
                     ball_x: f64, 
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
    //If there are remaining delay ticks, controller is neutral
    unsafe {
        if BALL_DELAY_TICKS != 0 {
            BALL_DELAY_TICKS -= 1;
            return 0;
        }
    }

    /* In any of these cases, controller is neutral as well
        1. Ball is traveling toward player instead of cpu
        2. The difference between the ball and paddle is less than distance_threshhold (calculated)
        3. The ball is static
    */
    let diff_history_x = ball_x - history_ball_x;
    let diff_history_y = ball_y - history_ball_y;
    let diff_y = ball_y - paddle2_y;

    let distance_threshhold = (paddle_height - ball_radius)/4.0;

    if diff_history_x < 0.0 
        || diff_y.abs() < distance_threshhold
        || diff_history_x.abs() == 0.0  
        || diff_history_y.abs() == 0.0 {
        return 0;
    }

    //Otherwise - it's a valid new controller press!
    get_controller(diff_y)
}

#[wasm_bindgen]
pub fn ai_update_delay(nTicks:i32) {
    unsafe {
        BALL_DELAY_TICKS = nTicks;
    }
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
