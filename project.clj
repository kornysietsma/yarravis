(defproject yarravis "0.0.1-SNAPSHOT"
  :description "Govhack yarra visualization thingy"
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [compojure "1.1.5"]
                 [ring "1.1.8"]
                 [ring/ring-json "0.2.0"]
                 [cheshire "5.2.0"]
                 [org.clojure/data.csv "0.1.2"]
                 [org.clojure/algo.generic "0.1.1"]
                 [org.clojure/tools.reader "0.7.4"]]
  :plugins [[lein-ring "0.8.2"]]
  :ring {
         :handler yarravis.core/app
         }
  :profiles {:dev {:dependencies [[midje "1.5.1"]]}})
  
