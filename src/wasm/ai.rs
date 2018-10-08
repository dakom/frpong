#[no_mangle]

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
                     history_paddle2_y:f64,
                     history_controller: i32
                     ) -> i32 
{

    //Could definitely be way fancier... deep learning etc.
    if ball_x < 512.0 {
        return history_controller
    }
    let diff_y = ball_y - paddle2_y;

    let controller = get_controller(diff_y);

    if diff_y.abs() > 10.0 {
       controller
    } else {
       1
    }
}

fn get_controller (diff:f64) -> i32 {

    //Controller values:
    // 0 = down
    // 1 = neutral
    // 2 = up
    //
    if diff < 0.0 { 
       0 
    } else if diff > 0.0 {
       2
    } else {
       1
    }
}
