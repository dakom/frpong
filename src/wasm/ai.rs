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
                     history_paddle2_y:f64
                     ) -> i32 
{

    //Could definitely be way fancier... deep learning etc.
    let ball_paddle_diff = ball_y - paddle2_y;

    //Controller values:
    // 0 = down
    // 1 = neutral
    // 2 = up
    //
    if ball_paddle_diff < 0.0 { 
       0 
    } else if ball_paddle_diff > 0.0 {
       2
    } else {
       1
    }
}
