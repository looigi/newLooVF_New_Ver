import { HttpClient } from "@angular/common/http";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ApiService } from "../services/api.service";

@Component({
    selector: 'ricerche',
    templateUrl: './ricerche.component.html',
    styleUrls: ['./ricerche.component.css']
})
export class RicercheComponent {
    @Input() immaginiRilevate;
    @Input() idCategoriaSelezionata;
    @Input() immagineAttuale;
    @Input() Categorie;

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

    constructor(
        private http: HttpClient,
        private apiService: ApiService,    
    ) {
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
}  