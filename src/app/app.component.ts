import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { ApiService } from './services/api.service';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'newLooVF';
  Filtro = '';
  Random = 'S';
  Categorie: any;
  immagineAttuale: any;
  dimeXImmagine;
  dimeYImmagine;
  schermoX = -1;
  schermoY = -1;
  mobile = false;
  margineX;
  margineY;
  idCategoriaSelezionata = 1;
  idCategoriaSelezionataPerSpostamento;
  staCaricando = false;
  menu = false;
  info = true;
  immaginiRilevateFuoriCategoria;
  bImmaginiFuoriCategoria = false;
  CaratteriRicerca = 3;
  ricercaPerCarattere = false;
  // vecchiaCategoriaSelezionata = '';
  mascheraFuoriCategoria = false;
  aliasPerFC1 = '';
  aliasPerFC2 = '';
  ricercaPerAnd = false;
  ricercaPerAnd2 = false;
  mascheraUguali = false;
  tipoRicercaUguali = 4;
  immaginiUguali;
  immaginiUgualiConFiltro;
  filtroUguali;
  ricercheCategoria = false;
  daSpostare;
  indiceSpostamento;
  FiltroCategoria = '';
  immaginiRilevateCategoria;
  dimensioniSchermo;
  mascheraNuoveCategorie = false;
  nuoveCategorie;
  nuoveCategorieFiltro;
  nuovaCategoriaSelezionata;
  mascheraSistemazioni = false;
  nomeNuovaCategoria = '';
  mascheraNomeNuovaCategoria = false;

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
  ) {
    this.checkScreen();
    
    const idC = localStorage.getItem('LooVFCategoriaAttuale');
    if (idC !== null) {
      this.idCategoriaSelezionata = +idC;
    }

    const idU = localStorage.getItem('LooVFTipoUguali');
    if (idU !== null) {
      this.tipoRicercaUguali = +idU;
    }

    const idF = localStorage.getItem('LooVFFiltroTesto');
    if (idF !== null) {
      this.Filtro = idF;
    }

    const idR = localStorage.getItem('LooVFRandom');
    if (idR !== null) {
      this.Random = idR;
    }

    const idInfo = localStorage.getItem('LooVFInfoVisibili');
    if (idInfo !== null) {
      this.info = idInfo === 'S' ? true : false;
    }

    const idRc = localStorage.getItem('LooVFRicercaPerCarattere');
    if (idRc !== null) {
      this.ricercaPerCarattere = idRc === 'S' ? true : false;
    }

    const idCS = localStorage.getItem('LooVFCategoriaPerSpostamento');
    if (idCS !== null) {
      this.idCategoriaSelezionataPerSpostamento = +idCS;
    }    

    const idRa = localStorage.getItem('LooVFRicercaPerAnd');
    if (idRa !== null) {
      this.ricercaPerAnd = idRa === 'S' ? true : false;
    }

    const idRa2 = localStorage.getItem('LooVFRicercaPerAnd2');
    if (idRa2 !== null) {
      this.ricercaPerAnd2 = idRa2 === 'S' ? true : false;
    }

    const idRcs = localStorage.getItem('LooVFRicercaCaratteri');
    if (idRcs !== null) {
      this.CaratteriRicerca = +idRcs;
    }

    this.http.get('assets/config.json').subscribe(d => {
      const urlWS = d['pathWS'] + 'newLooVF.asmx';
      this.apiService.impostaUrlWS(urlWS);

      this.caricaCategorie();

      const idI = localStorage.getItem('LooVFImmagineAttuale');
      if (idI !== null) {
        this.immagineAttuale = JSON.parse(idI);
        this.prendeAlias(this.immagineAttuale.Alias);
        this.prendeDimensioniImmagine(this.immagineAttuale);
      } else {
        this.immagineAttuale = undefined;
      }

      // this.vecchiaCategoriaSelezionata = this.idCategoriaSelezionata + ';' + (this.immagineAttuale ? this.immagineAttuale.idImmagine : '1');
    }, error => {
      alert('Lettura file JSON. ERRORE: ' + JSON.stringify(error._body));
    });
  }

  caricaCategorie() {
    this.apiService.RitornaCategorie(this)
      .map((response: any) => response)
      .subscribe(
        (data: any) => {
          if (data) {
            const data2 = this.apiService.prendeSoloDatiValidi(data);
            // console.log('Categorie', JSON.parse(data2));
            this.Categorie = JSON.parse(data2);
          }
        }
      );
  }

  clickIndietro() {
    this.caricaPrecedenteImmagine();
  }

  clickAvanti() {
    this.caricaProssimaImmagine();
  }

  caricaProssimaImmagine() {
    /* if (this.idCategoriaSelezionata + ';' + (this.immagineAttuale ? this.immagineAttuale.idImmagine : '1') === this.vecchiaCategoriaSelezionata) {
      return;
    }
    this.vecchiaCategoriaSelezionata = this.idCategoriaSelezionata + ';' + (this.immagineAttuale ? this.immagineAttuale.idImmagine : '1'); */

    const params = {
      idCategoria: this.idCategoriaSelezionata > -1 ? this.idCategoriaSelezionata : '',
      Filtro: this.Filtro,
      idImmagine: this.immagineAttuale ? this.immagineAttuale.idImmagine : 1,
      Random: this.Random
    }
    this.apiService.caricaProssimaImmagine(this, params)
      .map((response: any) => response)
      .subscribe(
        (data: any) => {
          if (data) {
            const data2 = this.apiService.prendeSoloDatiValidi(data);
            console.log('Immagine Successiva:', data2);
            const immagine = JSON.parse(data2);
            this.immagineAttuale = undefined;
            this.prendeAlias(immagine.Alias);
            this.prendeDimensioniImmagine(immagine);
            setTimeout(() => {
              this.immagineAttuale = immagine;
            }, 100);
            localStorage.setItem('LooVFImmagineAttuale', JSON.stringify(immagine));
          }
        }
      );
  }

  prendeAlias(Alias) {
    if (Alias) {
      const a = Alias.split(';');
      let aa = '';
      let bb = '';
      a.forEach(element => {
        if (element) {
          if (element.indexOf('*') > -1 || element.indexOf('$') > -1 || element.indexOf('%') > -1) {
            bb += element + ';';
          } else {
            aa += element + ';';
          }
        }
      });
      this.aliasPerFC1 = aa;
      this.aliasPerFC2 = bb;
    } else {
      this.aliasPerFC1 = '';
      this.aliasPerFC2 = '';
    }
  }

  prendeDimensioniImmagine(immagine) {
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

  caricaPrecedenteImmagine() {
    this.apiService.caricaPrecedenteImmagine(this)
      .map((response: any) => response)
      .subscribe(
        (data: any) => {
          if (data) {
            const data2 = this.apiService.prendeSoloDatiValidi(data);
          } else {

          }
        }
      );
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreen();
  }

  checkScreen() {
    this.schermoX = window.innerWidth;
    this.schermoY = window.innerHeight;

    if (this.schermoX < 500) {
      this.mobile = true;
      // console.log('true')
    } else {
      this.mobile = false;
      // console.log('false')
    }

    this.dimensioniSchermo = this.schermoX + ';' + this.schermoY + ';' + (this.mobile ? 'S' : 'N');

    if (this.immagineAttuale) {
      this.immagineAttuale.urlImmagine = undefined;
      this.prendeDimensioniImmagine(this.immagineAttuale);
      setTimeout(() => {
        this.immagineAttuale = this.immagineAttuale;
      }, 100);
    }

    console.log('Dimensioni schermo', this.schermoX, this.schermoY, this.mobile);
  }

  cambioCategoria(c) {
    console.log('Cambio categoria', c);
    setTimeout(() => {
      this.caricaProssimaImmagine();
    }, 100);
    localStorage.setItem('LooVFCategoriaAttuale', this.idCategoriaSelezionata.toString());
  }

  clickMenu() {
    this.menu = !this.menu;
  }

  refreshImmagini() {
    console.log('Refresh immagini', this.idCategoriaSelezionata);

    this.apiService.refreshImmagini(this, this.idCategoriaSelezionata)
      .map((response: any) => response)
      .subscribe(
        (data: any) => {
          if (data) {
            const data2 = this.apiService.prendeSoloDatiValidi(data);
            const resoconto = JSON.parse(data2);
            console.log('Refresh immagini: ', resoconto);
            alert('Aggiunte: ' + resoconto.Aggiunte + '\nEliminate: ' + resoconto.Eliminate);
          }
        }
      );
  }

  cambiaVisuaInfo(c) {
    this.info = c;
    localStorage.setItem('LooVFInfoVisibili', this.info ? 'S' : 'N');
  }

  immaginiFuoriCategoria() {
    let Caratteri = this.CaratteriRicerca.toString().trim();
    if (!this.ricercaPerCarattere) {
      Caratteri = '';
    }

    const params = {
      idCategoria: this.idCategoriaSelezionata,
      Aliases1: this.aliasPerFC1 ? this.aliasPerFC1 : '',
      Aliases2: this.aliasPerFC2 ? this.aliasPerFC2 : '',
      QuantiCaratteri: Caratteri,
      AndOr: this.ricercaPerAnd ? 'And' : 'Or'
    }
    this.immaginiRilevateFuoriCategoria = undefined;
    
    this.apiService.trovaImmaginiFuoriCategoria(this, params)
      .map((response: any) => response)
      .subscribe(
        (data: any) => {
          if (data) {
            const data2 = this.apiService.prendeSoloDatiValidi(data);
            if (data2.indexOf('ERROR:') === -1) {
              const resoconto = JSON.parse(data2);
              resoconto.Immagini.forEach(element => {
                element.Selezionata = false;
              });
              this.immaginiRilevateFuoriCategoria = resoconto.Immagini;
              if (this.immaginiRilevateFuoriCategoria.length > 0) {
                this.bImmaginiFuoriCategoria = true;
              } else {
                alert('Nessuna immagine fuori categoria rilevata');
              }
              // console.log('Trova immagini fuori categoria: ', resoconto);
            } else {
              this.immaginiRilevateFuoriCategoria = undefined;
              alert(data2);
            }
          }
        }
    );
  }

  cambiaRicCarattere() {
    this.ricercaPerCarattere = !this.ricercaPerCarattere;
    localStorage.setItem('LooVFRicercaPerCarattere', this.ricercaPerCarattere ? 'S' : 'N');
  }

  cambiaRicAnd() {
    this.ricercaPerAnd = !this.ricercaPerAnd;
    localStorage.setItem('LooVFRicercaPerAnd', this.ricercaPerAnd ? 'S' : 'N');
  }

  cambiaRicAnd2() {
    this.ricercaPerAnd2 = !this.ricercaPerAnd2;
    localStorage.setItem('LooVFRicercaPerAnd2', this.ricercaPerAnd2 ? 'S' : 'N');
  }

  cambioCaratteri() {
    // console.log(this.CaratteriRicerca);
    localStorage.setItem('LooVFRicercaCaratteri', this.CaratteriRicerca.toString().trim());
  }

  cambioTipoUguali(t) {
    this.tipoRicercaUguali = t;
    console.log('Tipo uguali', this.tipoRicercaUguali);
    localStorage.setItem('LooVFTipoUguali', this.tipoRicercaUguali.toString());
  }

  calcolaTipologia() {
    let tipologia = '';
    switch (this.tipoRicercaUguali) {
      case 1:
        tipologia = 'DATA';
        break;
      case 2:
        tipologia = 'DIMENSIONI';
        break;
      case 3:
        tipologia = 'EXIF';
        break;
      case 4:
        tipologia = 'HASH';
        break;
      case 5:
        tipologia = 'NOMEFILE';
        break;
    }

    return tipologia;
  }

  esegueRicercaUguali() {
    const tipologia = this.calcolaTipologia();
    if (!tipologia) {
      alert('Tipologia non valida: ' + tipologia);
      return;
    }

    this.apiService.ritornaImmaginiUguali(this, tipologia)
      .map((response: any) => response)
      .subscribe(
        (data: any) => {
          if (data) {
            const data2 = this.apiService.prendeSoloDatiValidi(data);
            if (data2.indexOf('ERROR:') === -1) {
              // console.log(data2);
              this.immaginiUguali = JSON.parse(data2);
              let p = false;
              this.immaginiUguali.forEach(element => {
                element.Pari = p;
                element.Premuto = false;
                p = !p;
              });
            } else {
              alert(data2);
            }
          }
        }
      );
  }
    
  eliminaImmagineImpostata(i, daDove) {
    if (!confirm('Si vuole eliminare l\'immagine?')) {
      return;
    }

    // this.immagineSelezionataPerEliminazione = i;
    console.log('Elimina immagine', i);
    this.apiService.eliminaImmagine(this, i.idImmagine)
      .map((response: any) => response)
      .subscribe(
        (data: any) => {
          if (data) {
            const data2 = this.apiService.prendeSoloDatiValidi(data);
            if (data2.indexOf('ERROR:') === -1) {
              if (daDove === 'FC') {
                // this.ricaricaImmagini.emit(new Date().toString());
              } else {
                if (daDove === 'IMPOSTATA') {
                  this.caricaProssimaImmagine();
                }
              }
            } else {
              alert(data2);
            }
          }
        }
      );
  }

  rigaSelezionataUguali(r) {
    this.immaginiUguali.forEach(element => {
      element.Premuto = false;
    });
    r.Premuto = true;

    console.log('Riga Selezionata Uguali', r);
    const tipologia = this.calcolaTipologia();
    if (!tipologia) {
      alert('Tipologia non valida: ' + tipologia);
      return;
    }

    const filtro = r.Valore;
    this.filtroUguali = filtro;
    this.immaginiUgualiConFiltro = undefined;

    this.apiService.ritornaImmaginiUgualiConFiltro(this, tipologia, filtro)
      .map((response: any) => response)
      .subscribe(
        (data: any) => {
          if (data) {
            const data2 = this.apiService.prendeSoloDatiValidi(data);
            if (data2.indexOf('ERROR:') === -1) {
              const imm = JSON.parse(data2);
              console.log('Immagini uguali rilevate', imm);
              this.immaginiUgualiConFiltro = imm.Immagini;
            } else {
              alert(data2);
            }
          }
        }
      );
  }

  cambiaRicRandom() {
    if (this.Random === 'S') {
      this.Random = 'N';
    } else {
      this.Random = 'S';
    }
    console.log('Ricerca random', this.Random);
    localStorage.setItem('LooVFRandom', this.Random);
  }

  uscitaFiltroTesto() {
    console.log('Filtro di ricerca impostato', this.Filtro);
    localStorage.setItem('LooVFFiltroTesto', this.Filtro);
  }

  cambioCategoriaPerSpostamento() {
    console.log('Cambio categoria per spostamento', this.idCategoriaSelezionataPerSpostamento);
    localStorage.setItem('LooVFCategoriaPerSpostamento', this.idCategoriaSelezionataPerSpostamento.toString());
  }

  spostaACategoria() {
    this.daSpostare = new Array();
    this.daSpostare.push(this.immagineAttuale.idImmagine);
    this.indiceSpostamento = 0;
    this.spostaImmagineACategoria(this.idCategoriaSelezionataPerSpostamento, false);
  }
    
  spostaImmagineACategoria(idCategoriaSelezionata, ricarica) {
    console.log('Spostamento a categoria', this.daSpostare[this.indiceSpostamento], idCategoriaSelezionata);
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
                  // this.ricaricaImmagini.emit(new Date().toString());
                } else {
                  this.caricaProssimaImmagine();
                }
              }
            } else {
              alert(data2);
            }
          }
        }
    );
  }

  immaginiCategoria() {
    const params = {
      idCategoria: this.idCategoriaSelezionata,
      Filtro: this.FiltroCategoria,
      AndOr: this.ricercaPerAnd2 ? 'And' : 'Or'
    }
    this.immaginiRilevateCategoria = undefined;
    
    this.apiService.ritornaImmaginiCategoria(this, params)
      .map((response: any) => response)
      .subscribe(
        (data: any) => {
          if (data) {
            const data2 = this.apiService.prendeSoloDatiValidi(data);
            if (data2.indexOf('ERROR:') === -1) {
              const resoconto = JSON.parse(data2);
              resoconto.Immagini.forEach(element => {
                element.Selezionata = false;
              });
              this.immaginiRilevateCategoria = resoconto.Immagini;
              if (this.immaginiRilevateCategoria.length > 0) {
                this.ricercheCategoria = true;
              } else {
                alert('Nessuna immagine categoria rilevata con il filtro attuale');
              }
              // console.log('Trova immagini fuori categoria: ', resoconto);
            } else {
              this.immaginiRilevateFuoriCategoria = undefined;
              alert(data2);
            }
          }
        }
    );
  }

  salvaAlias() {
    let alias = this.aliasPerFC1 + ';' + this.aliasPerFC2 + ';';
    while (alias.indexOf(';;') > -1) {
      alias = alias.replace(';;', ';');
    }
    console.log('Salvo alias', alias);
    this.apiService.salvaAlias(this, this.idCategoriaSelezionata, alias)
      .map((response: any) => response)
      .subscribe(
        (data: any) => {
          if (data) {
            const data2 = this.apiService.prendeSoloDatiValidi(data);
            if (data2.indexOf('ERROR:') === -1) {
              alert('Alias modificato');
            } else {
              alert(data2);
            }
          }
        }
    );
  }

  ricercaNuoveCategorie() {
    this.apiService.nuoveCategorie(this, this.idCategoriaSelezionata)
      .map((response: any) => response)
      .subscribe(
        (data: any) => {
          if (data) {
            const data2 = this.apiService.prendeSoloDatiValidi(data);
            if (data2.indexOf('ERROR:') === -1) {
              this.nuoveCategorie = JSON.parse(data2).Categorie;
              let p = false;
              this.nuoveCategorie.forEach(element => {
                element.Pari = p;
                element.Premuto = false;
                p = !p;
              });
              console.log('Nuove Categorie', this.nuoveCategorie);
            } else {
              alert(data2);
            }
          }
        }
    );    
  }

  selezioneNuovaCategoria(c) {
    this.nuoveCategorie.forEach(element => {
      element.Premuto = false;
    });
    c.Premuto = true;
    console.log('Click Nuova Categoria', c);
    this.nuovaCategoriaSelezionata = c.Categoria;

    this.apiService.TrovaNomiSuDbInBaseAllaNuovaCategoria(this, this.idCategoriaSelezionata, c.Categoria)
      .map((response: any) => response)
      .subscribe(
        (data: any) => {
          if (data) {
            const data2 = this.apiService.prendeSoloDatiValidi(data);
            if (data2.indexOf('ERROR:') === -1) {
              this.nuoveCategorieFiltro = JSON.parse(data2).Immagini;
              console.log('Nuove Categorie Filtrate', this.nuoveCategorieFiltro);
            } else {
              alert(data2);
            }
          }
        }
    );    
  }

  creaNuovaCategoria() {
    console.log('Click Crea Nuova Categoria', this.nuovaCategoriaSelezionata);
    this.nomeNuovaCategoria = this.nuovaCategoriaSelezionata;
    this.mascheraNomeNuovaCategoria = true;
  }

  salvaNuovaCategoria() {
    if (!this.nomeNuovaCategoria) {
      alert('Inserire il nome della categoria');
      return;
    }
    this.apiService.creaNuovaCategoria(this, this.nomeNuovaCategoria)
      .map((response: any) => response)
      .subscribe(
        (data: any) => {
          if (data) {
            const data2 = this.apiService.prendeSoloDatiValidi(data);
            if (data2.indexOf('ERROR:') === -1) {
              this.caricaCategorie();
              this.mascheraNuoveCategorie = false;
              alert('Nuova Categoria Creata');
            } else {
              alert(data2);
            }
          }
        }
    );    
  }
}
