
import { createSlice } from "@reduxjs/toolkit";

const initialState={
    product:{}
}

export const productSlice=createSlice({
    name:"productSlice",
    initialState,
    reducers:{
        addProductSlice:(state,action)=>{
            state.product=action.payload
        }
    }
})


export const {addProductSlice}=productSlice.actions
export default productSlice.reducer