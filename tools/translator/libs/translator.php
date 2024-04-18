<?php

require_once(__DIR__ . '/../config.php');
require_once(__DIR__ . '/GoogleTranslate.php');

use \Statickidz\GoogleTranslate;

/**
 * Translator scans JavaScript, HTML files, extracts strings and generate translation with JSON format.
 */
class Translator {

	public $files;
	public $strings;
	public $translations;

	/**
	 * Scan external resources
	 *
	 * @throws Exception
	 */
	public function scan() {
		global $SOURCE_DIRS;
		
		if (count($SOURCE_DIRS) == 0)
			throw new Exception('empty settings: $SOURCE_DIRS');

		foreach ($SOURCE_DIRS as $dir) {
			if (strpos($dir, '\\') !== false) {
				// Windows URL
				$dir = str_replace('/', '\\', $dir);
			}
			
			$dir = realpath($dir);

			if (is_dir($dir)) {
				// Directory
				$rii = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
				
				foreach ($rii as $file) {
					if ($file->isDir()) {
						continue;
					}
					
					$this->files[] = $file->getPathname();
				}
			} else if (is_file($dir)) {
				$this->files[] = $dir;
			} else {
				throw new Exception('Can not import object: ' . $dir);
			}
		}
	}

	/**
	 * Extracts strings from files
	 *
	 * @throws Exception
	 */
	public function extract() {
		$this->strings = array();
		foreach ($this->files as $file) {
			$content = file_get_contents($file);
			
			if ($content == '')
				throw new Exception('Can not get file content: ' . $content);

			$strings = array();

			// Drop SVG
			$content = preg_replace('|<path.*/>|i', '', $content);

			// Drop exceptions
			$content = preg_replace('|\/\/no-translate BEGIN[\s\S]+?\/\/no-translate END|mi', '', $content);

			// Drop
			$content = stripslashes($content);

			if (stripos($file, '.js') !== false) {
				// JSON

				$ignore_matches = [
					'\.addEventListener',
					'\.style\.',
					'aria-label',
					'\.font',
					'Path2D\(',
				];
				
				foreach ($ignore_matches as $ignore_match) {
					$content = preg_replace('/' . $ignore_match . '.*/', '', $content);
				}

				$content = preg_replace('|[\r\n][ \t]*//.*|', "\n", $content);

				// Extract between ' '
				$out = array();
				preg_match_all("/[']([^']*)[']/", $content, $out);
				$strings = array_merge($strings, $out[1]);

				// Extract between " "
				$out = array();
				preg_match_all('/["]([^"]*)["]/', $content, $out);
				$strings = array_merge($strings, $out[1]);
			}
			
			if (stripos($file, '.htm') !== false || true) {
				// HTML
				$ignore_attributes = [
					'dir',
					'lang',
					'http-equiv',
					'content',
					'name',
					'rel',
					'style',
					'onclick',
					'type',
					'class',
					'id',
					'href',
					'onchange',
					'onKeyUp',
					'oninput',
					'src',
					'aria-label',
				];
				
				foreach ($ignore_attributes as $ignore_attribute) {
					$content = preg_replace('/' . $ignore_attribute . '="[^"]*"/', '', $content);
				}

				// Extract between " "
				$out = array();
				preg_match_all('/["]([^"]*)["]/', $content, $out);
				//$strings = array_merge($strings, $out[1]);
				// Extract between > <
				$out = array();
				preg_match_all('|>([^<]{1,200})<[^ ]|', $content, $out);
				$strings = array_merge($strings, $out[1]);
			}

			foreach ($strings as $string) {
				if (trim($string) == '' || substr($string, 0, 2) == './')
					continue;

				// Remove tags
				$string = preg_replace('/<[^>]*>/', ' ', $string);
				$string = trim($string);

				$this->strings[] = $string;
			}
		}

		$this->strings = array_unique($this->strings);
		sort($this->strings);
	}

	/**
	 * Filters out some strings
	 */
	public function filter() {
		$copy = $this->strings;
		$this->strings = array();
		
		foreach ($copy as $string) {
			$string = trim($string);
			
			if (is_numeric($string)) {
				// Number
				continue;
			}
			
			if (strlen($string) < 2) {
				// Too short
				continue;
			}
			
			if (preg_replace("/[^A-Z0-9]+/", "", $string[0]) == '') {
				// First letter must be common uppercase letter or number
				continue;
			}
			
			if (is_numeric($string[0]) && strpos($string, ' ') === false) {
				// If first letter is number - Try to skip some
				continue;
			}
			
			if (strpos($string, '(') !== false && strpos($string, ')') !== false && strpos($string, '.') !== false) {
				// Function, not string
				continue;
			}
			
			if (strpos($string, "\n") !== false || strpos($string, "\r") !== false) {
				// Multi-line
				continue;
			}
			
			if (preg_replace("/[^a-z]+/", "", $string) == '') {
				// All caps - Not translatable
				continue;
			}
			
			if (strlen($string) > 30 && strpos($string, " ") === false) {
				// Long word without spaces
				continue;
			}

			$this->strings[] = $string;
		}
		
		$this->strings = array_unique($this->strings);
		$this->strings = array_values($this->strings);
	}

	/**
	 * Prepare strings for translating for user
	 *
	 * @throws Exception
	 */
	public function prepare() {
		$this->scan();
		$this->extract();
		$this->filter();

		$data = $this->strings;

		$in_content = '';
		
		if (isset($_POST['in']))
			$in_content = $_POST['in'];

		echo '<textarea name="out" style="width: 100%; height: 25vh;">' . implode("\n", $data) . '</textarea><br /><br />';
		echo 'Translate text above with <a href="https://translate.google.com/" title="Translator">Translator</a> and paste result below:<br /><br />';
		echo '<textarea name="in" style="width: 100%; height: 25vh;">' . $in_content . '</textarea><br />';
		echo '<input type="submit" name="action" value="Translate Manually" />';
	}

	/**
	 * Combines source strings and manually translated strings to json format
	 * 
	 * @param string $translation
	 *
	 * @throws Exception
	 */
	public function add_translation($translation) {
		$translation = trim($translation);
		if ($translation != '')
			$translation = explode("\n", $translation);
		else
			$translation = array();

		if (count($this->strings) == 0)
			throw new Exception('0 translations found in files.');
		if (count($this->strings) != count($translation))
			throw new Exception(count($this->strings) . ' translations imported from file, but you provided ' . count($translation) . ', it must match');

		$this->translations = new stdClass();
		foreach ($this->strings as $key => $value) {
			$translated = trim($translation[$key]);

			$this->translations->$value = $translated;
		}
	}

	/**
	 * Translates everything automatically
	 *
	 * @throws Exception
	 */
	public function auto_translate($action_string) {
		global $LANGUAGES, $LANG_DIR;

		$action_string = str_replace('Auto Translate: ', '', $action_string);
		
		if ($action_string == 'all') {
			$action_string = '';
		}

		$service = new GoogleTranslate();
		$text = implode("\n", $this->strings);

		foreach ($LANGUAGES as $lang) {
			if ($action_string != '' && $action_string != $lang) {
				continue;
			}

			echo "<br />$lang: ";

			$file_path = $LANG_DIR . strtolower($lang) . ".json";

			// Read old translations
			$old = array();
			
			if (file_exists($file_path)) {
				$old = file_get_contents($file_path);
				if ($old === false)
					throw new Exception('can not open file: ' . $file_path);
				$old = json_decode($old);
				if ($old === null)
					throw new Exception($file_path . ' data is not JSON');
			}

			$translation = $service->translate('en', $lang, $text);
			
			if ($translation == '') {
				throw new Exception('Empty response from translation service');
			}
			
			$translation = str_replace("\r", '', $translation);
			$translation = explode("\n", $translation);
			
			if (count($this->strings) != count($translation)) {
				throw new Exception(count($this->strings) . ' translations imported from file, but service gave: ' . count($translation) . ', it must match');
			}

			// Generate array
			$this->translations = new stdClass();
			
			foreach ($this->strings as $key => $value) {
				$translated = trim($translation[$key]);

				$this->translations->$value = $translated;
			}

			// Merge
			$merged = (object) array_merge((array) $this->translations, (array) $old);

			// Remove not use elements
			foreach ($merged as $k => $v) {
				if (isset($this->translations->$k) == false) {
					$v = null;
					unset($merged->$k);
				}
			}
			
			$this->translations = $merged;

			// Generate JSON
			$html = json_encode($this->translations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

			// Save
			$written = file_put_contents($file_path, $html);
			
			if ($written == 0) {
				throw new Exception('Can not write to: ' . $file_path);
			} else {
				echo 'OK';
			}

			// Sleep 05-1s
			usleep(rand(500, 1000) * 1000);
		}
	}

	/**
	 * Saves current data as empty file
	 *
	 * @throws Exception
	 */
	public function save_empty() {
		global $LANG_DIR_EMPTY;

		if ($LANG_DIR_EMPTY == '')
			return;
		
		$data = new stdClass();
		
		foreach($this->strings as $value){
			$data->$value = '';
		}

		$data_encoded = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

		$written = file_put_contents($LANG_DIR_EMPTY, $data_encoded);
		
		if ($written == 0) {
			throw new Exception('can not write to: ' . $LANG_DIR_EMPTY);
		} else {
			echo '<p><b>File updated: <b>' . $LANG_DIR_EMPTY . '</b></p>';
		}
	}

	/**
	 * Show formatted translation, use JSON. Parameters are only for testing mode
	 */
	public function show_merged() {
		echo '<textarea style="width: 100%; height: 30vh; margin-top: 10px;">';
		echo json_encode($this->translations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
		echo '</textarea>';
	}

	/**
	 * Merge 2 translations
	 *
	 * @throws Exception
	 */
	public function merge() {
		echo 'Old Translations: <b>(Priority on same keys)</b><br />';
		$value = '';
		
		if (isset($_POST['merge_old']))
			$value = $_POST['merge_old'];
		
		echo '<textarea style="width: 100%; height: 20vh;" name="merge_old">' . $value . '</textarea>';

		echo '<br /><br />';

		echo 'New Translations:<br />';
		$value = '';
		
		if (isset($_POST['merge_new']))
			$value = $_POST['merge_new'];
		
		echo '<textarea style="width: 100%; height: 20vh;" name="merge_new">' . $value . '</textarea>';
		echo '<input type="submit" name="action" value="Merge" title="Merge" /><br /><br />';

		if (isset($_POST['merge_old']) == false)
			return;

		$old = json_decode($_POST['merge_old']);
		$new = json_decode($_POST['merge_new']);

		if ($old === null)
			throw new Exception('Old data is not JSON');
		
		if ($new === null)
			throw new Exception('New data is not JSON');

		// Merge
		$merged = (object) array_merge((array) $new, (array) $old);

		// Remove not use elements
		foreach ($merged as $k => $v) {
			if (isset($new->$k) == false) {
				$v = null;
				unset($merged->$k);
			}
		}

		echo '<textarea style="width: 100%; height: 30vh;">';
		echo json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
		echo '</textarea>';
	}

}
