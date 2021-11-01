import { Pipe, PipeTransform } from '@angular/core';
import { Recogniser } from '../../../types';

@Pipe({
  name: 'recogniserName'
})
export class RecogniserNamePipe implements PipeTransform {

  transform(value: Recogniser): string {
    switch (value) {
      case 'leadmine-chemical-entities':
        return 'Chemical Entities';
      case 'leadmine-proteins':
        return 'Genes and Proteins';
      case 'leadmine-diseases':
        return 'Diseases';
      default:
        throw new Error('unknown recogniser')
    }
  }
}