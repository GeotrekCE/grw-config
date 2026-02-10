import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DEFAULT_CONFIG, GlobalConfig } from '../../models/config.model';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-integration-modal',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ 'MODAL.TITLE' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'MODAL.INSTRUCTION' | translate }}</p>
      <pre><code>{{ generateCode() }}</code></pre>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'ACTIONS.CLOSE' | translate }}</button>
      <button mat-raised-button color="primary" (click)="copyToClipboard()">
        <mat-icon>content_copy</mat-icon>
        {{ 'ACTIONS.COPY_CLIPBOARD' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    pre {
      background: #1f2937;
      color: #f3f4f6;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 0.875rem;
      white-space: pre-wrap;
      margin-top: 0.5rem;
    }
  `]
})
export class IntegrationModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: GlobalConfig) { }

  generateCode(): string {
    const c = this.data;
    const d = DEFAULT_CONFIG;
    const attrs: string[] = [];

    // Always included (mandatory)
    attrs.push(`api="${c.api}"`);
    attrs.push(`languages="${c.language}"`);
    if (c.nameLayer) attrs.push(`name-layer="${c.nameLayer}"`);
    if (c.urlLayer) attrs.push(`url-layer="${c.urlLayer}"`);
    if (c.attributionLayer) attrs.push(`attribution-layer="${c.attributionLayer}"`);

    // Arrays (only if non-empty)
    if (c.districts?.length) attrs.push(`districts="${c.districts.join(',')}"`);
    if (c.themes?.length) attrs.push(`themes="${c.themes.join(',')}"`);
    if (c.practices?.length) attrs.push(`practices="${c.practices.join(',')}"`);
    if (c.city?.length) attrs.push(`cities="${c.city.join(',')}"`);
    if (c.structure?.length) attrs.push(`structures="${c.structure.join(',')}"`);
    if (c.portals?.length) attrs.push(`portals="${c.portals.join(',')}"`);
    if (c.routes?.length) attrs.push(`routes="${c.routes.join(',')}"`);
    if (c.labels?.length) attrs.push(`labels="${c.labels.join(',')}"`);

    // Booleans (only if different from default)
    if (c.treks !== d.treks) attrs.push(`treks="${c.treks}"`);
    if (c.touristicContents !== d.touristicContents) attrs.push(`touristic-contents="${c.touristicContents}"`);
    if (c.touristicEvents !== d.touristicEvents) attrs.push(`touristic-events="${c.touristicEvents}"`);
    if (c.outdoor !== d.outdoor) attrs.push(`outdoor="${c.outdoor}"`);
    if (c.rounded !== d.rounded) attrs.push(`rounded="${c.rounded}"`);

    // String (only if non-empty and different from default)
    if (c.inBbox && c.inBbox !== d.inBbox) attrs.push(`in-bbox="${c.inBbox}"`);

    // Colors (only if theme is not default purple)
    if (c.theme && c.theme !== 'purple') {
      if (c.colorPrimaryApp && c.colorPrimaryApp !== d.colorPrimaryApp) attrs.push(`color-primary-app="${c.colorPrimaryApp}"`);
      if (c.colorPrimary && c.colorPrimary !== d.colorPrimary) attrs.push(`color-primary="${c.colorPrimary}"`);
      if (c.colorOnPrimary && c.colorOnPrimary !== d.colorOnPrimary) attrs.push(`color-on-primary="${c.colorOnPrimary}"`);
      if (c.colorPrimaryContainer && c.colorPrimaryContainer !== d.colorPrimaryContainer) attrs.push(`color-primary-container="${c.colorPrimaryContainer}"`);
      if (c.colorOnPrimaryContainer && c.colorOnPrimaryContainer !== d.colorOnPrimaryContainer) attrs.push(`color-on-primary-container="${c.colorOnPrimaryContainer}"`);
      if (c.colorSecondaryContainer && c.colorSecondaryContainer !== d.colorSecondaryContainer) attrs.push(`color-secondary-container="${c.colorSecondaryContainer}"`);
      if (c.colorOnSecondaryContainer && c.colorOnSecondaryContainer !== d.colorOnSecondaryContainer) attrs.push(`color-on-secondary-container="${c.colorOnSecondaryContainer}"`);
      if (c.colorBackground && c.colorBackground !== d.colorBackground) attrs.push(`color-background="${c.colorBackground}"`);
      if (c.colorSurface && c.colorSurface !== d.colorSurface) attrs.push(`color-surface="${c.colorSurface}"`);
      if (c.colorOnSurface && c.colorOnSurface !== d.colorOnSurface) attrs.push(`color-on-surface="${c.colorOnSurface}"`);
      if (c.colorSurfaceVariant && c.colorSurfaceVariant !== d.colorSurfaceVariant) attrs.push(`color-surface-variant="${c.colorSurfaceVariant}"`);
      if (c.colorOnSurfaceVariant && c.colorOnSurfaceVariant !== d.colorOnSurfaceVariant) attrs.push(`color-on-surface-variant="${c.colorOnSurfaceVariant}"`);
      if (c.colorSurfaceContainerHigh && c.colorSurfaceContainerHigh !== d.colorSurfaceContainerHigh) attrs.push(`color-surface-container-high="${c.colorSurfaceContainerHigh}"`);
      if (c.colorSurfaceContainerLow && c.colorSurfaceContainerLow !== d.colorSurfaceContainerLow) attrs.push(`color-surface-container-low="${c.colorSurfaceContainerLow}"`);
      if (c.fabBackgroundColor && c.fabBackgroundColor !== d.fabBackgroundColor) attrs.push(`fab-background-color="${c.fabBackgroundColor}"`);
      if (c.fabColor && c.fabColor !== d.fabColor) attrs.push(`fab-color="${c.fabColor}"`);

      if (c.colorTrekLine && c.colorTrekLine !== d.colorTrekLine) attrs.push(`color-trek-line="${c.colorTrekLine}"`);
      if (c.colorSensitiveArea && c.colorSensitiveArea !== d.colorSensitiveArea) attrs.push(`color-sensitive-area="${c.colorSensitiveArea}"`);
      if (c.colorOutdoorArea && c.colorOutdoorArea !== d.colorOutdoorArea) attrs.push(`color-outdoor-area="${c.colorOutdoorArea}"`);
      if (c.colorMarkers && c.colorMarkers !== d.colorMarkers) attrs.push(`color-markers="${c.colorMarkers}"`);
      if (c.colorClusters && c.colorClusters !== d.colorClusters) attrs.push(`color-clusters="${c.colorClusters}"`);
    }

    // Sizes (only if different from default)
    if (c.mainMarkerSize !== d.mainMarkerSize) attrs.push(`main-marker-size="${c.mainMarkerSize}"`);
    if (c.selectedMainMarkerSize !== d.selectedMainMarkerSize) attrs.push(`selected-main-marker-size="${c.selectedMainMarkerSize}"`);
    if (c.mainClusterSize !== d.mainClusterSize) attrs.push(`main-cluster-size="${c.mainClusterSize}"`);
    if (c.commonMarkerSize !== d.commonMarkerSize) attrs.push(`common-marker-size="${c.commonMarkerSize}"`);
    if (c.departureArrivalMarkerSize !== d.departureArrivalMarkerSize) attrs.push(`departure-arrival-marker-size="${c.departureArrivalMarkerSize}"`);
    if (c.pointReferenceMarkerSize !== d.pointReferenceMarkerSize) attrs.push(`point-reference-marker-size="${c.pointReferenceMarkerSize}"`);

    const attrsString = attrs.join('\n  ');

    return `<!-- Geotrek Rando Widget Dependencies -->
<link rel="stylesheet" href="https://rando-widget.geotrek.fr/latest/dist/geotrek-rando-widget/geotrek-rando-widget.css" />
<script type="module" src="https://rando-widget.geotrek.fr/latest/dist/geotrek-rando-widget/geotrek-rando-widget.esm.js"></script>
<script nomodule src="https://rando-widget.geotrek.fr/latest/dist/geotrek-rando-widget/geotrek-rando-widget.js"></script>

<!-- Widget Container -->
<grw-app 
  ${attrsString}
></grw-app>`;
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.generateCode());
  }
}
