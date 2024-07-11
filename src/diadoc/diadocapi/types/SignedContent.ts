import { IPowerOfAttorneyToPost } from './PowerOfAttorneyToPost';

export interface ISignedContent {
  Content?: string;
  Signature?: string;
  NameOnShelf?: string;
  SignWithTestSignature?: boolean;
  SignatureNameOnShelf?: string;
  PowerOfAttorney?: IPowerOfAttorneyToPost;
}
