import { HttpClient } from "@angular/common/http";
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { ApiService } from "../services/api.service";

@Component({
    selector: 'ricerche',
    templateUrl: './ricerche.component.html',
    styleUrls: ['./ricerche.component.css']
})
export class RicercheComponent implements OnInit, OnChanges {
    @Input() immaginiRilevate;
    @Input() idCategoriaSelezionata;
    @Input() immagineAttuale;
    @Input() Categorie;
    @Input() dimensioniSchermo;

    @Output() ricaricaImmagini: EventEmitter<any> = new EventEmitter<any>();
    @Output() caricaProssimaImmagine: EventEmitter<any> = new EventEmitter<any>();
    /* @Output() spostamentoImmagine: EventEmitter<any> = new EventEmitter<any>();
    @Output() visualizzazioneImmagine: EventEmitter<any> = new EventEmitter<any>();
    @Output() esegueSpostamentoImmagine: EventEmitter<any> = new EventEmitter<any>(); */

    bCiSonoSelezionati = false;
    quantiSelezionati = 0;
    daSpostare;
    indiceSpostamento;
    idCategoriaSelezionataPerSpostamento = 1;
    immagineSelezionataPerEliminazione;
    immagineDaVisualizzare;
    bVisualizzaImmagine = false;
    sceltaCategoria = false;
    schermoX;
    schermoY;
    mobile = false;
    dimensioneThumbX = 200;
    dimensioneThumbY = 200;
    staCaricando = false;

    constructor(
        private http: HttpClient,
        private apiService: ApiService,    
    ) {
        const idX = localStorage.getItem('LooVFDimeThumbX');
        if (idX !== null) {
          this.dimensioneThumbX = +idX;
        }

        const idY = localStorage.getItem('LooVFDimeThumbY');
        if (idY !== null) {
          this.dimensioneThumbY = +idY;
        }
    }
  
    esceThumbX() {
        localStorage.setItem('LooVFDimeThumbX', this.dimensioneThumbX.toString());
    }

    esceThumbY() {
        localStorage.setItem('LooVFDimeThumbY', this.dimensioneThumbY.toString());
    }

    ngOnInit(): void {
        
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['dimensioniSchermo']) {
            if (changes['dimensioniSchermo'].currentValue) {
                const c = changes['dimensioniSchermo'].currentValue.split(";");
                this.schermoX = (+c[0]) * .7;
                this.schermoY = +c[1];
                this.mobile = c[2] === 'S';

                if (this.mobile) {
                    this.dimensioneThumbX = 100;
                    this.dimensioneThumbY = 100;
                } else {
                    this.dimensioneThumbX = 200;
                    this.dimensioneThumbY = 200;
                }

                this.prendeDimensioniImmagine(this.immagineAttuale);
            }
        }
    }

    ciSonoSelezionati(i) {
        let Ritorno = false;
    
        i.Selezionata = !i.Selezionata;
        this.quantiSelezionati = 0;
    
        this.immaginiRilevate.forEach(element => {
          if (element.Selezionata === true) {
            this.quantiSelezionati++;
            Ritorno = true;
          }
        });
    
        this.bCiSonoSelezionati = Ritorno;
    }

    /* eliminaImmagine(i, daDove) {
        this.eliminazioneImmagine.emit({ immagine: i, daDove: 'UGUALI'});
    }

    spostaImmagineACategoriaDaFC1(i) {
        this.spostamentoImmagine.emit(i);
    }

    visualizzaImmagine(i) {
        this.visualizzazioneImmagine.emit(i);
    }

    esegueSpostamento() {
        this.esegueSpostamentoImmagine.emit();
    } */

    esegueSpostamento() {
        let id = new Array();
        this.immaginiRilevate.forEach(element => {
          if (element.Selezionata === true) {
            id.push(element.idImmagine);
          }
        });
        this.daSpostare = id;
        this.indiceSpostamento = 0;
        this.spostaImmagineACategoria(this.idCategoriaSelezionata, true);
      }
    
      spostaImmagineACategoria(idCategoriaSelezionata, ricarica) {
        this.apiService.SpostaImmagineACategoria(this, this.daSpostare[this.indiceSpostamento], idCategoriaSelezionata)
          .map((response: any) => response)
          .subscribe(
            (data: any) => {
              if (data) {
                const data2 = this.apiService.prendeSoloDatiValidi(data);
                if (data2.indexOf('ERROR:') === -1) {
                  this.indiceSpostamento++;
                  if (this.indiceSpostamento < this.daSpostare.length) {
                    setTimeout(() => {
                      this.spostaImmagineACategoria(idCategoriaSelezionata, ricarica);
                    }, 100);
                  } else {
                    if (ricarica) {
                      this.ricaricaImmagini.emit(new Date().toString());
                    } else {
                      this.caricaProssimaImmagine.emit(new Date().toString());
                    }
                  }
                } else {
                  alert(data2);
                }
              }
            }
        );
    }

    spostaACategoria() {
        this.daSpostare = new Array();
        this.daSpostare.push(this.immagineAttuale.idImmagine);
        this.indiceSpostamento = 0;
        this.spostaImmagineACategoria(this.idCategoriaSelezionataPerSpostamento, false);
    }
    
    /* eliminaimmagineImpostata() {
        this.eliminaImmagine({ immagine: this.immagineAttuale, daDove: 'IMPOSTATA' });
    } */
    
    eliminaImmagine(i, daDove) {
        if (!confirm('Si vuole eliminare l\'immagine?')) {
          return;
        }
    
        console.log('Eliminazione immagine', i, daDove);
        // return;

        this.immagineSelezionataPerEliminazione = i;
        console.log('Elimina immagine', i);
        this.apiService.eliminaImmagine(this, i.idImmagine)
          .map((response: any) => response)
          .subscribe(
            (data: any) => {
              if (data) {
                const data2 = this.apiService.prendeSoloDatiValidi(data);
                if (data2.indexOf('ERROR:') === -1) {
                  if (daDove === 'FC') {
                    this.ricaricaImmagini.emit(new Date().toString());
                  } else {
                    if (daDove === 'IMPOSTATA') {
                      this.caricaProssimaImmagine.emit(new Date().toString());
                    } else {
                      this.toglieImmagineDaUguali();
                    }
                  }
                } else {
                  alert(data2);
                }
              }
            }
          );
    }
    
    visualizzaImmagine(i) {
        console.log('Visualizza immagine', i);
        this.immagineDaVisualizzare = i.UrlImmagine;
        this.bVisualizzaImmagine = true;
    }
   
    cambioCategoriaPerSpostamento(c) {
        console.log('Cambio categoria per spostamento', c);
        localStorage.setItem('LooVFCategoriaPerSpostamento', this.idCategoriaSelezionataPerSpostamento.toString());
    }

    toglieImmagineDaUguali() {
        // console.log('Toglie immagini da uguali', this.immagineSelezionataPerEliminazione);
        const a = new Array();
        this.immaginiRilevate.forEach(element => {
            if (element.idImmagine !== this.immagineSelezionataPerEliminazione.idImmagine) {
                a.push(element);
            }
        });
        console.log('Toglie immagini da uguali', a);
        this.immaginiRilevate = undefined;
        setTimeout(() => {
            this.immaginiRilevate = a;
        }, 100);
        this.immagineSelezionataPerEliminazione = undefined;
    }
    
    spostaImmagineACategoriaDaFC1(i) {
        this.sceltaCategoria = true;
        this.daSpostare = new Array();
        this.immaginiRilevate.forEach(element => {
            if (element.Selezionata) {
                this.daSpostare.push(element.idImmagine);
            }
        });
        console.log(this.daSpostare);
    }

    spostaImmagineACategoriaDaFC2() {
        console.log('Sposta immagine a categoria', this.daSpostare, this.idCategoriaSelezionataPerSpostamento);
        this.indiceSpostamento = 0;
        this.spostaImmagineACategoria(this.idCategoriaSelezionataPerSpostamento, true);
        this.sceltaCategoria = false;
    }    

    margineX;
    margineY;
    dimeXImmagine;
    dimeYImmagine;

    prendeDimensioniImmagine(immagine) {
        if (!immagine) {
            return;
        }

        const dimensione = immagine.DimensioniImmagine;
        if (dimensione.indexOf('x') > -1) {
          const d = dimensione.split('x');
          let x = +d[0];
          let y = +d[1];
          // console.log('Dime originali', x, y);
    
          if (x < (this.schermoX - 5) && y < (this.schermoY - 5)) {
            this.margineX = 2;
            this.margineY = 2;
            this.dimeXImmagine = x;
            this.dimeYImmagine = y;
          } else {
            let maxX;
    
            if (x > y) {
              maxX = x;
            } else {
              if (x < y) {
                maxX = y;
              } else {
                maxX = x;
              }
            }
    
            const percX = ((this.schermoX - 5) / x);
            const percY = ((this.schermoY - 5) / y);
            // console.log('Percs', percX, percY);
    
            let x1;
            let y1;
            if (percX < percY) {
              x1 = x * percX;
              y1 = y * percX;
            } else {
              x1 = x * percY;
              y1 = y * percY;
            }
    
            // console.log('X1/Y1', x1, y1);
    
            this.dimeXImmagine = Math.floor(x1);
            this.dimeYImmagine = Math.floor(y1);
          }
        }
    
        this.margineX = Math.floor(Math.floor(this.schermoX / 2) - Math.floor(this.dimeXImmagine / 2));
        this.margineY = Math.floor(Math.floor(this.schermoY / 2) - Math.floor(this.dimeYImmagine / 2));
    
        // console.log('Dimensioni', this.dimeXImmagine, this.dimeYImmagine, this.margineX, this.margineY);
    }
   
    SelezionaTutti() {
        this.immaginiRilevate.forEach(element => {
            element.Selezionata = true;
        });

        this.quantiSelezionati = this.immaginiRilevate.length;
        this.bCiSonoSelezionati = true;
    }

    DeselezionaTutti() {
        this.immaginiRilevate.forEach(element => {
            element.Selezionata = false;
        });

        this.quantiSelezionati = 0;
        this.bCiSonoSelezionati = false;
    }
}  