#[no_mangle]

//Controller values:
// -1 = down
// 1 = up
// 0 = neutral
pub fn ai_controller(ball_y:f64, paddle_y:f64) -> i32 {
    if ball_y < paddle_y {
        -1
    } else if ball_y > paddle_y {
        1
    } else {
        0
    }
}
