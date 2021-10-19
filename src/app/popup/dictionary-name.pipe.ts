import { Pipe, PipeTransform } from '@angular/core';
import { DictionaryPath } from '../../types';

@Pipe({
  name: 'dictionaryName'
})
export class DictionaryNamePipe implements PipeTransform {

  transform(value: DictionaryPath): string {
    switch (value) {
      case 'chemical-entities':
        return 'Chemical Entities';
      case 'proteins':
        return 'Genes and Proteins';
      case 'diseases':
        return 'Diseases';
      default:
        throw new Error('unrecognised dictionary path')
    }
  }
}