import { HttpClient } from "@angular/common/http";
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
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

  immaginiVisualizzate;
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
  filtroAperto = false;
  filtro = '';
  altezzaLinguetta = 0;
  larghezzaLinguetta = 0;
  linguettaVisibile = true;
  elementiPerPagina = 30;
  numeroPagina = 1;
  pagineTotali = 0;
  minimoImmagine = 0;
  massimoImmagine = this.elementiPerPagina - 1;
  Categorie2;
  tipoOrdinamento = 1;
  filtroCategoria = '';

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
      setTimeout(() => {
        const a = document.getElementById('barraSuperiore');
        if (a !== null) {
          this.altezzaLinguetta = a?.offsetTop + a?.offsetHeight - 1;
          this.larghezzaLinguetta = (a.offsetLeft + a.offsetWidth) - 88;
        }
      }, 1000);
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['immaginiRilevate']) {
      if (changes['immaginiRilevate'].currentValue) {
        this.numeroPagina = 1;
        this.pagineTotali = Math.ceil((changes['immaginiRilevate'].currentValue.length - 1) / this.elementiPerPagina);
      } else {
        this.numeroPagina = 1;
        this.pagineTotali = 0;
      }
      this.calcolaIF();

      this.filtro = '';
      this.immaginiVisualizzate = undefined;
      this.uscitaFiltro();
      this.DeselezionaTutti();
    }

    if (changes['Categorie']) {
      const c = new Array();
      let p = false;
      if (changes['Categorie'].currentValue) {
        changes['Categorie'].currentValue.forEach(element => {
          if (element.Categoria !== 'Tutte') {
            element.Pari = p;
            if (this.idCategoriaSelezionataPerSpostamento === element.idCategoria) {
              element.Selezionata = true;
            } else {
              element.Selezionata = false;
            }
            p = !p;

            c.push(element);
          }
        });
        if (this.tipoOrdinamento === 0) {
          c.sort((a, b) => b.Categoria - a.Categoria);
        } else {
          c.sort((a, b) => b.Immagini - a.Immagini);
        }
      }
      this.Categorie = c;
      this.filtroCategoria = '';
      this.cambiatoFiltroCategoria();
    }

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

  cambiatoFiltroCategoria() {
    setTimeout(() => {
      console.log('Filtro categoria', this.filtroCategoria);
      if (!this.filtroCategoria) {
        this.Categorie2 = this.Categorie;
      } else {
        const c = new Array();
        this.Categorie.forEach(element => {
          if (element.Categoria.toUpperCase().indexOf(this.filtroCategoria.toUpperCase()) > -1) {
            c.push(element);
          }
        });
        this.Categorie2 = c;
      }
    }, 100);
  }

  ordinaCategorie(t) {
    this.tipoOrdinamento = t;
    const c = JSON.parse(JSON.stringify(this.Categorie2));
    if (this.tipoOrdinamento === 0) {
      // c.sort((a, b) => b.Categoria - a.Categoria);
      this.Categorie2 = JSON.parse(JSON.stringify(this.Categorie));
    } else {
      c.sort((a, b) => b.Immagini - a.Immagini);
      this.Categorie2 = JSON.parse(JSON.stringify(c));
    }
    // console.log('Categorie', c, this.Categorie2);
  }

  selezionaCategoria(c) {
    this.idCategoriaSelezionataPerSpostamento = c.idCategoria;
    this.Categorie2.forEach(element => {
      if (this.idCategoriaSelezionataPerSpostamento === element.idCategoria) {
        element.Selezionata = true;
      } else {
        element.Selezionata = false;
      }
    });
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
  
    eliminaFatte(quale) {
      this.immaginiVisualizzate.forEach(element => {
        if (element.idImmagine === quale) {
          element.EsisteImmagine = false;
        }
      });
      this.immaginiRilevate.forEach(element => {
        if (element.idImmagine === quale) {
          element.EsisteImmagine = false;
        }
      });
    }

    spostaImmagineACategoria(idCategoriaSelezionata, ricarica) {
      this.apiService.SpostaImmagineACategoria(this, this.daSpostare[this.indiceSpostamento], idCategoriaSelezionata)
        .map((response: any) => response)
        .subscribe(
          (data: any) => {
            if (data) {
              const data2 = this.apiService.prendeSoloDatiValidi(data);
              if (data2.indexOf('ERROR:') === -1) {
                this.eliminaFatte(this.daSpostare[this.indiceSpostamento]);
                  
                this.indiceSpostamento++;
                if (this.indiceSpostamento < this.daSpostare.length) {
                  setTimeout(() => {
                    this.spostaImmagineACategoria(idCategoriaSelezionata, ricarica);
                  }, 100);
                } else {
                  this.DeselezionaTutti();

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
                this.eliminaFatte(i.idImmagine);

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
      this.prendeDimensioniImmagine(i);
      this.linguettaVisibile = false;
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
  
  spostaImmagineACategoriaDaFC1() {
      this.sceltaCategoria = true;
      this.daSpostare = new Array();
      this.immaginiRilevate.forEach(element => {
          if (element.Selezionata) {
              this.daSpostare.push(element.idImmagine);
          }
      });
      // console.log(this.daSpostare);
      this.spostaImmagineACategoriaDaFC2();
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
  
      console.log('Dimensioni immagini ricerca', this.dimeXImmagine, this.dimeYImmagine, this.margineX, this.margineY);
  }
  
  SelezionaTutti() {
    if (this.immaginiVisualizzate) {
      this.immaginiVisualizzate.forEach(element => {
        if (element.EsisteImmagine) {
          element.Selezionata = true;
        } else {
          element.Selezionata = false;
        }
      });

      this.quantiSelezionati = this.immaginiVisualizzate.length;
      this.bCiSonoSelezionati = true;
    }
  }

  DeselezionaTutti() {
    if (this.immaginiVisualizzate) {
      this.immaginiVisualizzate.forEach(element => {
          element.Selezionata = false;
      });

      this.quantiSelezionati = 0;
      this.bCiSonoSelezionati = false;
    }
  }

  uscitaFiltro() {
    if (this.immaginiRilevate) {
      const a = new Array();
      this.immaginiRilevate.forEach(element => {
        if (this.filtro) {
          if (element.NomeFile.toUpperCase().indexOf(this.filtro.toUpperCase().trim()) > -1) {
            a.push(element);
          }
        } else {
          a.push(element);
        }
      });
      console.log('Ricerca: ', this.immaginiRilevate, this.immaginiVisualizzate, this.filtro);
      this.immaginiVisualizzate = a;
    }
  }

  calcolaIF() {
    const inizio = (this.numeroPagina - 1) * this.elementiPerPagina;
    this.minimoImmagine = inizio;
    this.massimoImmagine = inizio + this.elementiPerPagina - 1;

    console.log('Minimo: ', this.minimoImmagine);
    console.log('Massimo: ', this.massimoImmagine);
  }

  indietroPagina() {
    if (this.numeroPagina > 1) {
      this.numeroPagina--;

      this.calcolaIF();
    }
  }

  avantiPagina() {
    if (this.numeroPagina < this.pagineTotali) {
      this.numeroPagina++;

      this.calcolaIF();
    }
  }
}  