/*
 * Copyright 2022 Medicines Discovery Catapult
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { environment as PROD_ENV } from './environment.prod'
export const environment = {
  production: false,
  nerURL: 'http://localhost:8081',
  compoundConverterURL: 'http://localhost:8082/convert',
  unichemURL: 'http://localhost:8080',
  pdfConverterURL: 'http://localhost:8000/html',
  bio: true
}
