const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm

module.exports = {
   mode: 'development',
   entry: './src/index.js',   
   output:{
      //Build outside, so that the root in server for location /psgc will be the container of the psgc app e.g. /data
      path: path.join(__dirname,'../'),
      filename: 'philgc.bundle.js',
   },
   plugins: [
      new HtmlWebpackPlugin({template: './src/public/index.html'})
   ],
   module: {
      rules: [
         { test: /\.css$/, use: ['style-loader','css-loader'] },
         {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader"
            }
          }
      ]
   },
   devServer: {

      contentBase: path.join(__dirname, '../web_dist'),
      compress: true,
      port: 9000,
      proxy: {
         '/apiv1': 'http://localhost:8085'
      }

    }
}
