import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-widget-frame',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (config(); as c) {
      <grw-app
        [attr.api]="c.api"
        [attr.languages]="c.languages"
        [attr.districts]="c.districts"
        [attr.themes]="c.themes"
        [attr.practices]="c.practices"
        [attr.cities]="c.cities"
        [attr.structures]="c.structures"
        [attr.in-bbox]="c.inBbox"
        [attr.portals]="c.portals"
        [attr.routes]="c.routes"
        [attr.labels]="c.labels"

        [attr.color-primary-container]="c.colorPrimaryContainer"
        [attr.name-layer]="c.nameLayer" 
        [attr.url-layer]="c.urlLayer"
        [attr.attribution-layer]="c.attributionLayer"
        [attr.treks]="c.treks"
        [attr.touristic-contents]="c.touristicContents"
        [attr.touristic-events]="c.touristicEvents"
        [attr.outdoor]="c.outdoor"
        [attr.color-primary-app]="c.colorPrimaryApp"
        [attr.color-primary]="c.colorPrimary"
        [attr.color-on-primary]="c.colorOnPrimary"
        [attr.color-surface]="c.colorSurface"
        [attr.color-on-surface]="c.colorOnSurface"
        [attr.color-surface-variant]="c.colorSurfaceVariant"
        [attr.color-on-surface-variant]="c.colorOnSurfaceVariant"
        [attr.color-on-primary-container]="c.colorOnPrimaryContainer"
        [attr.color-secondary-container]="c.colorSecondaryContainer"
        [attr.color-on-secondary-container]="c.colorOnSecondaryContainer"
        [attr.color-background]="c.colorBackground"
        [attr.color-surface-container-high]="c.colorSurfaceContainerHigh"
        [attr.color-surface-container-low]="c.colorSurfaceContainerLow"
        [attr.fab-background-color]="c.fabBackgroundColor"
        [attr.fab-color]="c.fabColor"
        [attr.rounded]="c.rounded"
        [attr.color-trek-line]="c.colorTrekLine"
        [attr.color-sensitive-area]="c.colorSensitiveArea"
        [attr.color-outdoor-area]="c.colorOutdoorArea"
        [attr.color-markers]="c.colorMarkers"
        [attr.color-clusters]="c.colorClusters"
        [attr.main-marker-size]="c.mainMarkerSize"
        [attr.selected-main-marker-size]="c.selectedMainMarkerSize"
        [attr.main-cluster-size]="c.mainClusterSize"
        [attr.common-marker-size]="c.commonMarkerSize"
        [attr.departure-arrival-marker-size]="c.departureArrivalMarkerSize"
        [attr.point-reference-marker-size]="c.pointReferenceMarkerSize"
      ></grw-app>
    }
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
    grw-app {
      display: block;
      height: 100%;
      width: 100%;
    }
  `]
})
export class WidgetFrameComponent implements OnInit {
  private route = inject(ActivatedRoute);

  config = signal<any>(null);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.config.set({
        api: params['api'],
        languages: params['languages'],
        districts: params['districts'],
        themes: params['themes'],
        practices: params['practices'],
        cities: params['cities'],
        structures: params['structures'],
        inBbox: params['inBbox'],
        portals: params['portals'],
        routes: params['routes'],
        labels: params['labels'],

        colorPrimaryContainer: params['color-primary-container'],
        nameLayer: params['name-layer'],
        urlLayer: params['url-layer'],
        attributionLayer: params['attribution-layer'],
        treks: params['treks'],
        touristicContents: params['touristicContents'],
        touristicEvents: params['touristicEvents'],
        outdoor: params['outdoor'],

        colorPrimaryApp: params['color-primary-app'],
        colorPrimary: params['color-primary'],
        colorOnPrimary: params['color-on-primary'],
        colorSurface: params['color-surface'],
        colorOnSurface: params['color-on-surface'],
        colorSurfaceVariant: params['color-surface-variant'],
        colorOnSurfaceVariant: params['color-on-surface-variant'],
        colorOnPrimaryContainer: params['color-on-primary-container'],
        colorSecondaryContainer: params['color-secondary-container'],
        colorOnSecondaryContainer: params['color-on-secondary-container'],
        colorBackground: params['color-background'],
        colorSurfaceContainerHigh: params['color-surface-container-high'],
        colorSurfaceContainerLow: params['color-surface-container-low'],
        fabBackgroundColor: params['fab-background-color'],
        fabColor: params['fab-color'],
        rounded: params['rounded'],

        colorTrekLine: params['color-trek-line'],
        colorSensitiveArea: params['color-sensitive-area'],
        colorOutdoorArea: params['color-outdoor-area'],
        colorMarkers: params['color-markers'],
        colorClusters: params['color-clusters'],
        mainMarkerSize: params['main-marker-size'],
        selectedMainMarkerSize: params['selected-main-marker-size'],
        mainClusterSize: params['main-cluster-size'],
        commonMarkerSize: params['common-marker-size'],
        departureArrivalMarkerSize: params['departure-arrival-marker-size'],
        pointReferenceMarkerSize: params['point-reference-marker-size'],
      });

      // Inject resources dynamically to ensure they are present in this "page" (the iframe)
      if (!document.getElementById('grw-script')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://rando-widget.geotrek.fr/latest/dist/geotrek-rando-widget/geotrek-rando-widget.css';
        document.head.appendChild(link);

        const scriptModule = document.createElement('script');
        scriptModule.type = 'module';
        scriptModule.src = 'https://rando-widget.geotrek.fr/latest/dist/geotrek-rando-widget/geotrek-rando-widget.esm.js';
        scriptModule.id = 'grw-script';
        document.head.appendChild(scriptModule);

        const scriptNoModule = document.createElement('script');
        scriptNoModule.noModule = true;
        scriptNoModule.src = 'https://rando-widget.geotrek.fr/latest/dist/geotrek-rando-widget/geotrek-rando-widget.js';
        document.head.appendChild(scriptNoModule);

        // Resize trigger
        window.addEventListener('load', () => {
          setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
        });
      }
    });
  }
}
