import { Injectable } from '@angular/core';
import { ExternalHttpClient } from './httpclient.service';

@Injectable()
export class ApiService {
  urlWS = '';

  constructor(
    private httpclient: ExternalHttpClient,
  ) 
  {
  }

  ritornaUrlWS() {
    return this.urlWS;
  }

  impostaUrlWS(e1) {
    this.urlWS = e1;
  }

  cambiaChar(ee, c1, c2) {
    while (ee.indexOf(c1) > -1) {
        ee = ee.replace(c1, c2);
    }
    return ee;
  }

  sistemaTesto(e): string {
    if (e === undefined || e === 'undefined' || e === '' || e === null) {
        return '';
    }

    let ee = e.toString();

    ee = this.cambiaChar(ee, '<', '%3C');
    ee = this.cambiaChar(ee, '>', '%3E');
    ee = this.cambiaChar(ee, '#', '%23');
    ee = this.cambiaChar(ee, '{', '%7B');
    ee = this.cambiaChar(ee, '}', '%7D');
    ee = this.cambiaChar(ee, '|', '%7C');
    ee = this.cambiaChar(ee, '\\', '%5C');
    ee = this.cambiaChar(ee, '^', '%5E');
    ee = this.cambiaChar(ee, '~', '%7E');
    ee = this.cambiaChar(ee, '[', '%5B');
    ee = this.cambiaChar(ee, ']', '%5D');
    ee = this.cambiaChar(ee, '`', '%60');
    // ee = this.cambiaChar(ee, ';', '%3B');
    ee = this.cambiaChar(ee, '/', '%2F');
    ee = this.cambiaChar(ee, '?', '%3F');
    ee = this.cambiaChar(ee, ':', '%3A');
    ee = this.cambiaChar(ee, '@', '%40');
    ee = this.cambiaChar(ee, '=', '%3D');
    ee = this.cambiaChar(ee, '&', '%26');
    ee = this.cambiaChar(ee, '$', '%24');

    return ee;
  }

  prendeSoloDatiValidi(s) {
    let ss = s;

    let a1 = ss.indexOf('<string');
    if (a1 > -1) {
      ss = ss.substring(a1, ss.length);
      a1 = ss.indexOf('>');
      if (a1 > -1) {
        ss = ss.substring(a1 + 1, ss.length);
        a1 = ss.indexOf('</string>');
        if (a1 > -1) {
          ss = ss.substring(0, a1);
        }
      }
    }

    ss = this.cambiaChar(ss, '&amp;', '&');
    ss = this.cambiaChar(ss, '&lt;', '<');
    ss = this.cambiaChar(ss, '&gt;', '>');
    ss = this.cambiaChar(ss, '&num;', '#');
    ss = this.cambiaChar(ss, '&lcub; &lbrace;', '{');
    ss = this.cambiaChar(ss, '&lcub;', '{');
    ss = this.cambiaChar(ss, '&lbrace;', '{');
    ss = this.cambiaChar(ss, '&lcub;&lbrace;', '{');
    ss = this.cambiaChar(ss, '&rcub; &rbrace;', '}');
    ss = this.cambiaChar(ss, '&rcub;', '}');
    ss = this.cambiaChar(ss, '&rbrace;', '}');
    ss = this.cambiaChar(ss, '&rcub;&rbrace;', '}');
    ss = this.cambiaChar(ss, '&verbar;', '|');
    ss = this.cambiaChar(ss, '&vert;', '|');
    ss = this.cambiaChar(ss, '&VerticalLine;', '|');
    ss = this.cambiaChar(ss, '&bsol;', '\\');
    ss = this.cambiaChar(ss, '&circ;', '^');
    ss = this.cambiaChar(ss, '&tilde;', '~');
    ss = this.cambiaChar(ss, '&lsqb;', '[');
    ss = this.cambiaChar(ss, '&lbrack;', '[');
    ss = this.cambiaChar(ss, '&rsqb;', ']');
    ss = this.cambiaChar(ss, '&rbrack;', ']');
    ss = this.cambiaChar(ss, '&grave;', '`');
    ss = this.cambiaChar(ss, '&semi;', ';');
    ss = this.cambiaChar(ss, '&sol;', '/');
    ss = this.cambiaChar(ss, '&quest;', '?');
    ss = this.cambiaChar(ss, '&colon;', ':');
    ss = this.cambiaChar(ss, '&commat;', '@');
    ss = this.cambiaChar(ss, '&equals;', '=');
    ss = this.cambiaChar(ss, '&dollar;', '$');

    return ss;
  }

  RitornaCategorie(t) {
    const url = this.urlWS + '/RitornaCategorie'
      ;
    const ritorno = this.httpclient.get(t, url);
    return ritorno;
  }

  carica(t, url) {
    t.staCaricando = true;
    const ritorno = this.httpclient.get(t, url);
    return ritorno;
  }

  caricaProssimaImmagine(t, params) {
    const url = this.urlWS + '/ProssimaImmagine?' +
      'idCategoria=' + params.idCategoria + '&' + 
      'Filtro=' + params.Filtro + '&' +
      'idImmagine=' + params.idImmagine + '&' +
      'Random=' + params.Random
      ;
    return this.carica(t, url);
  }

  caricaPrecedenteImmagine(t) {
    const url = this.urlWS + '/PrecedenteImmagine'
      ;
    return this.carica(t, url);
  }

  refreshImmagini(t, idCategoria) {
    const url = this.urlWS + '/RefreshImmagini?idCategoria=' + idCategoria
      ;
    return this.carica(t, url);
  }

  eliminaImmagine(t, idImmagine) {
    const url = this.urlWS + '/EliminaImmagine?idImmagine=' + idImmagine
      ;
    return this.carica(t, url);
  }

  ritornaImmaginiUguali(t, tipologia) {
    const url = this.urlWS + '/RitornaImmaginiUguali?Modalita=' + tipologia
      ;
    return this.carica(t, url);
  }

  ritornaImmaginiCategoria(t, params) {
    const url = this.urlWS + '/RitornaImmaginiCategoria?idCategoria=' + params.idCategoria + '&Filtro=' + params.Filtro
      ;
    return this.carica(t, url);
  }

  ritornaImmaginiUgualiConFiltro(t, tipologia, filtro) {
    const url = this.urlWS + '/RitornaImmaginiUgualiConFiltro?Modalita=' + tipologia + '&Filtro=' + filtro
      ;
    return this.carica(t, url);
  }

  trovaImmaginiFuoriCategoria(t, params) {
    const url = this.urlWS + '/TrovaNomiSuDbFuoriDallaCategoria?' +
      'idCategoria=' + params.idCategoria + 
      '&Aliases1=' + params.Aliases1 +
      '&Aliases2=' + params.Aliases2 +
      '&QuantiCaratteri=' + params.QuantiCaratteri +
      '&AndOr=' + params.AndOr
      ;
    return this.carica(t, url);
  }

  SpostaImmagineACategoria(t, idImmagine, idCategoria) {
    const url = this.urlWS + '/SpostaImmagineACategoria?idImmagine=' + idImmagine + '&idCategoriaNuova=' + idCategoria
      ;
    return this.carica(t, url);
  }
}
