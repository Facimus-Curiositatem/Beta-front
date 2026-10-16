import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Usuario } from '../models/usuario';
import { CrearUsuarioRequest } from '../models/crear-usuario-request';
import { ActualizarUsuarioRequest } from '../models/actualizar-usuario-request';