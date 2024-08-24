import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ExternalHttpClient } from './services/httpclient.service';
import { ApiService } from './services/api.service';
import { FormsModule } from '@angular/forms';
import { RicercheComponent } from './ricerche/ricerche.component';

@NgModule({
  declarations: [
    AppComponent,
    RicercheComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    ExternalHttpClient,
    ApiService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
