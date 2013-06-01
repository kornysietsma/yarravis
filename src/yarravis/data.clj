(ns yarravis.data
  (:require [clojure.data.csv :as csv]
            [clojure.java.io :as io]))

(defn csv-to-maps [data]
  (let [headers (first data)
        rows (rest data)]
    (map #(zipmap headers %) rows)))

(defn read-data [name]
  (-> (str "data/" name)
      slurp
      csv/read-csv
      csv-to-maps))

(defn locations []
  (read-data "locations.tsv"))

(defn elevations []
  (read-data "sheet4.tsv"))
