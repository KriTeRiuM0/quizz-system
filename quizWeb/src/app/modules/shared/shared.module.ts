import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoNgZorroAntdModule } from '../../DemoNgZorroAntdModule';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink } from '@angular/router';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
    RouterLink,
    DemoNgZorroAntdModule
    ], exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
    RouterLink,
    DemoNgZorroAntdModule
  ]
})
export class SharedModule { }
