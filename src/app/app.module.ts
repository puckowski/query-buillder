import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppSqlOperator } from './sql-builder/sql-components/sql-operator.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { AppSqlField } from './sql-builder/sql-components/sql-field.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { AppSqlBuilder } from './sql-builder/sql-builder.component';
import { AppSqlConstant } from './sql-builder/sql-components/sql-constant';

@NgModule({
  declarations: [
    AppComponent,
    AppSqlBuilder
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppSqlOperator,
    BrowserAnimationsModule,
    ButtonModule,
    AppSqlField,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    AppSqlConstant
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
