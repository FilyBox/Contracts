export type MyFormData = {
  id: number;
  productId: string;
  productType: string; // "Product Type" in DB
  productTitle: string; // "Product Title" in DB
  productVersion?: string; // "Product Version" in DB
  productDisplayArtist: string; // "Product Display Artist" in DB
  parentLabel?: string; // "Parent Label" in DB
  label: string;
  originalReleaseDate?: string; // "Original Release Date" in DB
  releaseDate: string; // "Release Date" in DB
  upc: string; // "UPC" in DB
  catalog: string; // "Catalog " in DB (note the space)
  productPriceTier?: string; // "Product Price Tier" in DB
  productGenre: string; // "Product Genre" in DB
  submissionStatus: string; // "Submission Status" in DB
  productCLine: string; // "Product C Line" in DB
  productPLine: string; // "Product P Line" in DB
  preOrderDate?: string; // "PreOrder Date" in DB
  exclusives?: string; // "Exclusives" in DB
  explicitLyrics: string; // "ExplicitLyrics" in DB
  productPlayLink?: string; // "Product Play Link" in DB
  linerNotes?: string; // "Liner Notes" in DB
  primaryMetadataLanguage: string; // "Primary Metadata Language" in DB
  compilation?: string; // "Compilation" in DB
  pdfBooklet?: string; // "PDF Booklet" in DB
  timedReleaseDate?: string; // "Timed Release Date" in DB
  timedReleaseMusicServices?: string; // "Timed Release Music Services" in DB
  lastProcessDate: string; // "Last Process Date" in DB
  importDate: string; // "Import Date" in DB
  createdBy: string; // "Created By" in DB
  lastModified: string; // "Last Modified" in DB
  submittedAt: string; // "Submitted At" in DB
  submittedBy?: string; // "Submitted By" in DB
  vevoChannel?: string; // "Vevo Channel" in DB
  trackType: string; // "TrackType" in DB
  trackId: string; // "Track Id" in DB
  trackVolume?: boolean; // "Track Volume" in DB
  trackNumber: string; // "Track Number" in DB
  trackName: string; // "Track Name" in DB
  trackVersion?: string; // "Track Version" in DB
  trackDisplayArtist: string; // "Track Display Artist" in DB
  isrc: string; // "Isrc" in DB
  trackPriceTier?: string; // "Track Price Tier" in DB
  trackGenre: string; // "Track Genre" in DB
  audioLanguage: string; // "Audio Language" in DB
  trackCLine: string; // "Track C Line" in DB
  trackPLine: string; // "Track P Line" in DB
  writersComposers: string; // "WritersComposers" in DB
  publishersCollectionSocieties: string; // "PublishersCollection Societies" in DB
  withholdMechanicals: string; // "Withhold Mechanicals" in DB
  preOrderType?: string; // "PreOrder Type" in DB
  instantGratificationDate?: string; // "Instant Gratification Date" in DB
  duration: string; // "Duration" in DB
  sampleStartTime?: string; // "Sample Start Time" in DB
  explicitLyricsTrack: string; // "Explicit Lyrics" in DB
  albumOnly: string; // "Album Only" in DB
  lyrics?: string; // "Lyrics" in DB
  additionalContributorsPerforming?: string; // "AdditionalContributorsPerforming" in DB
  additionalContributorsNonPerforming?: string; // "AdditionalContributorsNonPerforming" in DB
  producers?: string; // "Producers" in DB
  continuousMix?: string; // "Continuous Mix" in DB
  continuouslyMixedIndividualSong?: string; // "Continuously Mixed Individual Song" in DB
  trackPlayLink?: string; // "Track Play Link" in DB
};
