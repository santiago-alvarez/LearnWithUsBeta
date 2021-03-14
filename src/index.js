import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import axios from 'axios';
let ruta = "http://localhost:4884/";
const data = {
    usuario: 'zpidi',
    id: 4,
    image: ''
}
ReactDOM.render(
    <React.StrictMode >
        <Router >
            <Switch >
                <Route path="/" >
                    <form enctype="multipart/form-data" method="post">
                        <input type="file" name="image" id="image" />
                        <input type="button" onClick={async () => {
                            const dataDefinitivo = new FormData();
                            data.image = await document.getElementById("image").files[0];
                            dataDefinitivo.append('image', data.image);
                            dataDefinitivo.append('id', data.id);
                            dataDefinitivo.append('usuario', data.usuario);
                            console.log(dataDefinitivo);
                            await axios.post(ruta + "usuarios-upload-avatar", dataDefinitivo)
                                .then((res) => {
                                    console.log(res);
                                })
                                .catch((err) => {
                                    console.log(err)
                                });
                        }} />
                    </form>
                    <div>
                        <div id="descarga">
                        </div>
                        <div id="descarga-xlsx">

                        </div>
                        <button onClick={async () => {
                            const data = {
                                id_curso: 1,
                                id_clase: 2,
                                titulo: "Primer curso"
                            }
                            /*
                            window.open(`http://localhost:4884/clases-pdfInforme/donwload/${data.id_curso}&${data.id_clase}&${data.titulo}`);
                            */
                            axios.get(`http://localhost:4884/clases-pdfInforme/donwload/${data.id_curso}&${data.id_clase}&${data.titulo}`, { responseType: 'blob' })
                                .then((response) => {
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', 'Informe.pdf');
                                    const Element = document.getElementById("descarga");
                                    Element.appendChild(link);
                                    link.click();
                                })
                                .catch((err) => {
                                    console.log(err);
                                })
                        }}>
                            Descargar pdf
                        </button>
                    </div>
                    <div>
                        <button onClick={async () =>{
                            const data = {
                                id_curso: 1,
                                id_clase: 2,
                                titulo: "Primer curso"
                            }
                            axios.get(`http://localhost:4884/clases-xlsxInforme/donwload/${data.id_curso}&${data.id_clase}`, {responseType: 'blob'})
                            .then((response)=>{
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', 'Informe.xlsx');
                                    const Element = document.getElementById("descarga-xlsx");
                                    Element.appendChild(link);
                                    link.click();
                            })
                            .catch((err) =>{
                                console.log(err);
                            })
                        }}>
                            Descargar xlsx
                        </button>
                    </div>
                </Route>
            </Switch>
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
);