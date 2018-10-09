#![feature(custom_attribute)]

extern crate wasm_bindgen;

mod wasm {
    pub mod trajectory;
    pub mod ai; 
}

pub use wasm::*;
