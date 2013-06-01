(ns yarravis.data
  (:require [clojure.data.csv :as csv]
            [clojure.java.io :as io]
            [clojure.algo.generic.math-functions :as math]))

(def precision 0.0000001)

(defn csv-to-maps [data]
  (let [headers (first data)
        rows (rest data)]
    (map #(zipmap headers %) rows)))

(defn read-data [name]
  (-> (str "data/" name)
      slurp
      (csv/read-csv :separator \tab)
      csv-to-maps))

(defn clean-loc [loc]
  {:desc (loc "Location desc from google")
   :desc2 (loc "location desc from data")
   :lat (Double/parseDouble (loc "lat"))
   :long (Double/parseDouble (loc "long"))})

(defn locations-data []
  (map clean-loc (read-data "locations.tsv")))

(def locations (memoize locations-data))

(defn clean-elevdata [ed]
  {:lat (Double/parseDouble (ed "lat"))
   :long (Double/parseDouble (ed "lng"))
   :elevation (Double/parseDouble (ed "elevation"))
   :resolution (Double/parseDouble (ed "resolution"))})

(defn elevation-data []
  (let [raw-data (read-data "sheet4.tsv")]
    (map clean-elevdata raw-data)))

(def elevations (memoize elevation-data))

(defn elevation [lat long]
  (let [results (filter
                 #(and (math/approx= lat (:lat %) precision)
                       (math/approx= long (:long %) precision)) (elevations))]
    (cond (= 1 (count results)) (first results)
          (< 1 (count results))
          (do (println (str (count results) " results for " lat " / " long))
              (first results))
          :else (do (println (str "no results for " lat " / " long))
              nil))))

(defn mapdata []
  (map #(assoc % :elev (elevation (:lat %) (:long %))) (locations))
  )
